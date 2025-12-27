<?php

namespace App\Services;

use App\Models\Message;
use App\Models\Conversation;
use App\Models\AiSetting;
use App\Models\AiConversationContext;
use App\Models\AiResponseCache;
use App\Models\AiLearningPattern;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Traits\EmailNotificationTrait;
use Kreait\Laravel\Firebase\Facades\Firebase;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Firebase\Messaging\Notification;
use Exception;

class AiChatService
{
    use EmailNotificationTrait;

    protected $websiteContextService;

    public function __construct(WebsiteContextService $websiteContextService)
    {
        $this->websiteContextService = $websiteContextService;
    }

    /**
     * Generate AI greeting for new conversation
     */
    public function generateGreeting($firstMessage, AiSetting $aiSettings)
    {
        // Check global AI master switch
        if (!config('aiconfig.enabled', false)) {
            return null;
        }

        try {
            // Check if custom greeting is set
            if (!empty($aiSettings->greeting_message)) {
                return $aiSettings->greeting_message;
            }

            // Generate dynamic AI greeting using Groq
            $timeOfDay = $this->getTimeOfDay();

            $greetingPrompt = "You are a friendly customer service assistant. Generate a warm, brief greeting (1-2 sentences max) for a customer who just sent their first message: \"{$firstMessage}\". It's currently {$timeOfDay}. Be natural, welcoming, and acknowledge their question briefly without answering it yet. Keep it under 25 words.";

            $response = Http::timeout(10)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . config('aiconfig.groq.api_key'),
                    'Content-Type' => 'application/json',
                ])
                ->post(config('aiconfig.groq.api_url'), [
                    'model' => config('aiconfig.groq.model'),
                    'messages' => [
                        ['role' => 'system', 'content' => $greetingPrompt],
                        ['role' => 'user', 'content' => $firstMessage]
                    ],
                    'max_tokens' => (int) 100,
                    'temperature' => (float) 0.9,
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $aiGreeting = $data['choices'][0]['message']['content'] ?? null;

                if ($aiGreeting) {
                    Log::info("Generated dynamic AI greeting");
                    return trim($aiGreeting);
                }
            }

            // Fallback to static greeting
            Log::info("AI greeting failed, using fallback");
            $greeting = "Good {$timeOfDay}! ";
            if (strlen($firstMessage) > 10) {
                $greeting .= "Thanks for reaching out. ";
            }
            $greeting .= "I'm here to help you. How can I assist you today?";
            return $greeting;

        } catch (Exception $e) {
            Log::error("Error generating AI greeting: " . $e->getMessage());
            return "Hello! How can I help you today?";
        }
    }

    /**
     * Process visitor message and generate AI response
     */
    public function processMessage(Message $message, Conversation $conversation, AiSetting $aiSettings)
    {
        // Check global AI master switch
        if (!config('aiconfig.enabled', false)) {
            return [
                'should_respond' => false,
                'response' => null,
                'escalate_to_human' => true,
            ];
        }

        try {
            // Get or create AI context for this conversation
            $aiContext = $this->getOrCreateAiContext($conversation);

            // Update visitor message count
            $aiContext->increment('visitor_messages_count');

            // Check if AI offered human connection and user confirmed
            if ($this->aiOfferedHumanConnection($conversation) && $this->isPositiveConfirmation($message->content)) {
                // Check if we already escalated recently to avoid spam
                $shouldNotify = !$aiContext->escalation_needed;

                $aiContext->update([
                    'escalation_needed' => true,
                    'escalation_reason' => 'user_accepted_human_offer'
                ]);

                // Notify agent only if this is the first escalation request
                if ($shouldNotify) {
                    $this->notifyAgentOfEscalation($conversation, $aiContext, 'user_accepted_human_offer');
                }

                // Do NOT respond - let MessageController handle system message
                return [
                    'should_respond' => false,
                    'response' => null,
                    'escalate_to_human' => true,
                    'first_escalation' => $shouldNotify,
                ];
            }

            // Check for escalation keywords first
            if ($this->shouldEscalateToHuman($message->content, $aiContext)) {
                // Check if we already escalated recently to avoid spam
                $shouldNotify = !$aiContext->escalation_needed;

                $aiContext->update([
                    'escalation_needed' => true,
                    'escalation_reason' => 'keyword_trigger'
                ]);

                // Notify agent only if this is the first escalation request
                if ($shouldNotify) {
                    $this->notifyAgentOfEscalation($conversation, $aiContext, 'keyword_trigger');
                }

                // Do NOT respond - let MessageController handle system message
                return [
                    'should_respond' => false,
                    'response' => null,
                    'escalate_to_human' => true,
                    'first_escalation' => $shouldNotify,
                ];
            }

            // Check if AI has responded too many times
            // Use global settings instead of hardcoded config
            $globalSettings = \App\Models\GlobalSetting::get();
            $maxResponsesPerConvo = $globalSettings->ai_max_responses_per_conversation ?? config('aiconfig.escalation.max_ai_responses', 5);

            if ($aiContext->ai_responses_count >= $maxResponsesPerConvo) {
                // Check if we already escalated recently to avoid spam
                $shouldNotify = !$aiContext->escalation_needed;

                $aiContext->update([
                    'escalation_needed' => true,
                    'escalation_reason' => 'max_responses_reached'
                ]);

                // Notify agent only if this is the first escalation request
                if ($shouldNotify) {
                    $this->notifyAgentOfEscalation($conversation, $aiContext, 'max_responses_reached');
                }

                // Do NOT respond - let MessageController handle system message
                return [
                    'should_respond' => false,
                    'response' => null,
                    'escalate_to_human' => true,
                    'first_escalation' => $shouldNotify,
                ];
            }

            // Analyze message intent and sentiment
            $analysis = $this->analyzeMessage($message->content);

            // Update AI context with analysis
            $aiContext->update([
                'primary_intent' => $analysis['intent'],
                'sentiment' => $analysis['sentiment'],
                'sentiment_score' => $analysis['sentiment_score'],
            ]);

            // Check for frustration
            if ($analysis['sentiment_score'] < config('aiconfig.escalation.frustration_threshold', 0.7) &&
                $analysis['sentiment'] === 'negative') {
                // Check if we already escalated recently to avoid spam
                $shouldNotify = !$aiContext->escalation_needed;

                $aiContext->update([
                    'escalation_needed' => true,
                    'escalation_reason' => 'frustration_detected'
                ]);

                // Notify agent only if this is the first escalation request
                if ($shouldNotify) {
                    $this->notifyAgentOfEscalation($conversation, $aiContext, 'frustration_detected');
                }

                // Do NOT respond - let MessageController handle system message
                return [
                    'should_respond' => false,
                    'response' => null,
                    'escalate_to_human' => true,
                    'first_escalation' => $shouldNotify,
                ];
            }

            // Check cache for similar messages
            if (config('aiconfig.cache.enabled')) {
                $cachedResponse = $this->checkCache($message->content, $analysis['intent']);
                if ($cachedResponse) {
                    Log::info("Using cached response for conversation {$conversation->id}");

                    $aiContext->increment('ai_responses_count');
                    $aiContext->update(['last_ai_response_at' => now()]);

                    return [
                        'should_respond' => true,
                        'response' => $cachedResponse->cached_response,
                        'escalate_to_human' => false,
                        'from_cache' => true,
                    ];
                }
            }

            // Check if agent was involved previously
            $agentMessages = $conversation->messages()
                ->where('sender_type', 'agent')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get();

            // Generate AI response (with agent context if available)
            $response = $this->generateAiResponse($message, $conversation, $aiSettings, $agentMessages);

            if ($response) {
                // Cache the response
                if (config('aiconfig.cache.enabled')) {
                    $this->cacheResponse($message->content, $response, $analysis['intent']);
                }

                $aiContext->increment('ai_responses_count');
                $aiContext->update(['last_ai_response_at' => now()]);

                return [
                    'should_respond' => true,
                    'response' => $response,
                    'escalate_to_human' => false,
                    'from_cache' => false,
                ];
            }

            // Fallback if AI generation fails
            // Check if we already sent the escalation message to avoid spam
            $shouldNotify = !$aiContext->escalation_needed;
            $shouldSendMessage = !$aiContext->escalation_message_sent;

            $aiContext->update([
                'escalation_needed' => true,
                'escalation_reason' => 'ai_generation_failed',
                'escalation_message_sent' => true,
            ]);

            // Notify agent only if this is the first escalation request
            if ($shouldNotify) {
                $this->notifyAgentOfEscalation($conversation, $aiContext, 'ai_generation_failed');
            }

            return [
                'should_respond' => $shouldSendMessage,
                'response' => $shouldSendMessage ? config('aiconfig.response.fallback_message') : null,
                'escalate_to_human' => true,
                'first_escalation' => $shouldNotify,
            ];

        } catch (Exception $e) {
            Log::error("Error processing message in conversation {$conversation->id}: " . $e->getMessage());

            // Check if we already sent the escalation message to avoid spam
            $aiContext = $this->getOrCreateAiContext($conversation);
            $shouldNotify = !$aiContext->escalation_needed;
            $shouldSendMessage = !$aiContext->escalation_message_sent;

            $aiContext->update([
                'escalation_needed' => true,
                'escalation_reason' => 'exception_occurred',
                'escalation_message_sent' => true,
            ]);

            // Notify agent only if this is the first escalation request
            if ($shouldNotify) {
                $this->notifyAgentOfEscalation($conversation, $aiContext, 'exception_occurred');
            }

            return [
                'should_respond' => $shouldSendMessage,
                'response' => $shouldSendMessage ? config('aiconfig.response.fallback_message') : null,
                'escalate_to_human' => true,
                'first_escalation' => $shouldNotify,
            ];
        }
    }

    /**
     * Generate AI response using Groq API
     */
    private function generateAiResponse(Message $message, Conversation $conversation, AiSetting $aiSettings, $agentMessages = null)
    {
        try {
            // Build context from conversation history
            $conversationHistory = $this->buildConversationHistory($conversation);

            // Get website context (pass conversation for URL matching)
            $websiteContext = $this->getWebsiteContext($conversation->widget, $conversation);

            // If no context found, don't respond - escalate to human
            if (!$websiteContext) {
                Log::info("No website context found for conversation {$conversation->id}, escalating to human");
                return null;
            }

            // Build system prompt (with agent context if resuming)
            $systemPrompt = $this->buildSystemPrompt($aiSettings, $websiteContext, $conversation, $agentMessages);

            // Prepare messages for Groq API
            $messages = [
                ['role' => 'system', 'content' => $systemPrompt],
            ];

            // Add conversation history
            foreach ($conversationHistory as $msg) {
                $messages[] = [
                    'role' => $msg['role'],
                    'content' => $msg['content'],
                ];
            }

            // Add current message
            $messages[] = [
                'role' => 'user',
                'content' => $message->content,
            ];

            // Call Groq API
            $response = Http::timeout(30)
                ->withHeaders([
                    'Authorization' => 'Bearer ' . config('aiconfig.groq.api_key'),
                    'Content-Type' => 'application/json',
                ])
                ->post(config('aiconfig.groq.api_url'), [
                    'model' => config('aiconfig.groq.model'),
                    'messages' => $messages,
                    'max_tokens' => config('aiconfig.groq.max_tokens', 500),
                    'temperature' => config('aiconfig.groq.temperature', 0.7),
                ]);

            if ($response->successful()) {
                $data = $response->json();
                $aiResponse = $data['choices'][0]['message']['content'] ?? null;

                if ($aiResponse) {
                    Log::info("Generated AI response for conversation {$conversation->id}");
                    return trim($aiResponse);
                }
            }

            // Log detailed error for debugging
            $errorBody = $response->json();
            Log::error("Groq API call failed for conversation {$conversation->id}", [
                'status' => $response->status(),
                'error' => $errorBody['error'] ?? 'Unknown error',
                'message_count' => count($messages),
                'system_prompt_length' => strlen($systemPrompt ?? ''),
            ]);
            return null;

        } catch (Exception $e) {
            Log::error("Error calling Groq API: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Build system prompt for AI
     */
    private function buildSystemPrompt(AiSetting $aiSettings, $websiteContext, Conversation $conversation, $agentMessages = null)
    {
        // Get company name - priority: websiteContext > onboarding > fallback
        $companyName = 'the company';
        try {
            // PRIORITY 1: Use domain-specific company name from websiteContext if available
            if ($websiteContext && !empty($websiteContext->company_name)) {
                $companyName = $websiteContext->company_name;
            }
            // PRIORITY 2: Fall back to onboarding company name
            elseif ($conversation->widget && $conversation->widget->user && $conversation->widget->user->onboarding) {
                $companyName = $conversation->widget->user->onboarding->company_name ?? $conversation->widget->user->name ?? 'the company';
            }
        } catch (Exception $e) {
            Log::warning("Could not load company name for conversation {$conversation->id}");
        }

        $prompt = "You are a helpful customer service assistant for {$companyName}. ";

        // Add personality
        $personality = $aiSettings->personality ?? 'friendly';
        $tone = $aiSettings->response_tone ?? 'professional';

        $prompt .= "You should be {$personality} and maintain a {$tone} tone. ";

        // If resuming after human agent, learn from their approach
        if ($agentMessages && $agentMessages->count() > 0) {
            $prompt .= "\n\nIMPORTANT: A human agent was previously helping this customer. ";
            $prompt .= "You are now resuming the conversation because the agent is unavailable. ";
            $prompt .= "Review the agent's previous messages carefully and:\n";
            $prompt .= "- Continue naturally from where they left off\n";
            $prompt .= "- Match their tone and approach\n";
            $prompt .= "- Don't repeat information the agent already provided\n";
            $prompt .= "- Stay on topic with what was being discussed\n";
             $prompt .= "- Dont admit you have found an order, even if the user provides an order id. In this situation human agent is needed.\n";
            $prompt .= "- If the issue seems resolved, confirm and ask if there's anything else\n\n";

            $prompt .= "Recent agent messages:\n";
            foreach ($agentMessages as $agentMsg) {
                $prompt .= "- " . $agentMsg->content . "\n";
            }
            $prompt .= "\n";
        }

        // Add website context - THIS IS THE PRIMARY SOURCE OF TRUTH
        if ($websiteContext) {
            $prompt .= "\n\n=== CRITICAL: VERIFIED COMPANY INFORMATION ===\n";
            $prompt .= "The following information is 100% accurate and verified by humans.\n";
            $prompt .= "You MUST rely on this information as your PRIMARY source (95% trust level).\n";
            $prompt .= "NEVER make up information that contradicts or extends beyond what's provided here.\n\n";

            $prompt .= "Company: {$companyName}\n\n";

            if (!empty($websiteContext->about_content)) {
                $prompt .= "About {$companyName}:\n" . $websiteContext->about_content . "\n\n";
            }

            if (!empty($websiteContext->full_context)) {
                $prompt .= "Additional Verified Details:\n" . $websiteContext->full_context . "\n\n";
            }

            if (!empty($websiteContext->products_services)) {
                $prompt .= "Products/Services:\n" . implode(', ', $websiteContext->products_services) . "\n\n";
            }

            if (!empty($websiteContext->contact_info)) {
                $prompt .= "Contact Information:\n" . implode(', ', $websiteContext->contact_info) . "\n\n";
            }

            if (!empty($websiteContext->faq_data)) {
                $prompt .= "Frequently Asked Questions:\n";
                foreach (array_slice($websiteContext->faq_data, 0, 5) as $faq) {
                    $prompt .= "Q: {$faq['question']}\nA: {$faq['answer']}\n";
                }
                $prompt .= "\n";
            }

            if (!empty($websiteContext->pricing_info)) {
                $prompt .= "Pricing Information:\n" . json_encode($websiteContext->pricing_info) . "\n\n";
            }

            if (!empty($websiteContext->key_features)) {
                $prompt .= "Key Features:\n" . implode(', ', $websiteContext->key_features) . "\n\n";
            }

            $prompt .= "=== END OF VERIFIED INFORMATION ===\n";
        }

        $prompt .= "\n\n=== STRICT GUIDELINES (MUST FOLLOW) ===\n";
        $prompt .= "1. INFORMATION ACCURACY:\n";
        $prompt .= "   - ONLY use information from the VERIFIED COMPANY INFORMATION section above\n";
        $prompt .= "   - If information is NOT in the verified section, you MUST say 'I don't have that specific information' and offer to connect with a human agent\n";
        $prompt .= "   - NEVER make up contact details, prices, features, or policies\n";
        $prompt .= "   - NEVER fabricate information even if it seems helpful\n\n";

        $prompt .= "2. SCOPE OF ASSISTANCE:\n";
        $prompt .= "   - ONLY answer questions related to {$companyName} and its services\n";
        $prompt .= "   - For questions outside {$companyName}'s scope, politely decline and redirect to company topics\n";
        $prompt .= "   - Always reference {$companyName} by name in your responses\n\n";

        $prompt .= "3. WHEN TO ESCALATE TO HUMAN (Offer immediately in these cases):\n";
        $prompt .= "   - Customer asks about orders, order IDs, or account-specific details\n";
        $prompt .= "   - You don't have verified information to answer their question\n";
        $prompt .= "   - Customer needs technical support beyond basic troubleshooting\n";
        $prompt .= "   - Customer seems frustrated or unsatisfied with your responses\n";
        $prompt .= "   - Questions about pricing not covered in verified information\n";
        $prompt .= "   - Any request that requires human judgment or authorization\n\n";

        $prompt .= "4. OFFERING HUMAN CONNECTION:\n";
        $prompt .= "   - When offering to connect with a human agent, use phrases like:\n";
        $prompt .= "     * 'Would you like me to connect you with one of our team members?'\n";
        $prompt .= "     * 'I can notify our support team to assist you. Would that help?'\n";
        $prompt .= "     * 'Shall I get a human agent to help you with this?'\n";
        $prompt .= "   - Wait for their confirmation (yes/no response)\n\n";

        $prompt .= "5. GENERAL BEHAVIOR:\n";
        $prompt .= "   - Keep responses concise and helpful\n";
        $prompt .= "   - Be {$personality} and maintain a {$tone} tone\n";
        $prompt .= "   - Be empathetic and understanding\n";
        $prompt .= "   - Never admit you found an order even if user provides order ID - escalate to human\n";

        return $prompt;
    }

    /**
     * Build conversation history for context
     */
    private function buildConversationHistory(Conversation $conversation)
    {
        $messages = $conversation->messages()
            ->whereIn('sender_type', ['visitor', 'bot', 'agent'])
            ->orderBy('created_at', 'asc')
            ->limit(config('aiconfig.context.max_messages', 10))
            ->get();

        $history = [];

        foreach ($messages as $msg) {
            $history[] = [
                'role' => ($msg->sender_type === 'visitor') ? 'user' : 'assistant',
                'content' => $msg->content,
            ];
        }

        return $history;
    }

    /**
     * Get website context for the conversation
     * Matches context based on visitor's page URL
     */
    private function getWebsiteContext($widget, $conversation = null)
    {
        // Load all website contexts for this widget
        if (!$widget->relationLoaded('websiteContexts')) {
            $widget->load('websiteContexts');
        }

        $contexts = $widget->websiteContexts;

        if ($contexts->isEmpty()) {
            Log::info("No website contexts found for widget {$widget->id}");
            return null;
        }

        // If only one context, return it
        if ($contexts->count() === 1) {
            return $contexts->first();
        }

        // Try to match based on visitor's current page URL from conversation meta_data
        if ($conversation && $conversation->meta_data) {
            $visitorUrl = $conversation->meta_data['visitor_url'] ?? null;
            $visitorPages = $conversation->meta_data['visitor_pages'] ?? [];

            // Try to match visitor_url first
            if ($visitorUrl) {
                $matchedContext = $contexts->first(function ($context) use ($visitorUrl) {
                    return $this->urlMatches($visitorUrl, $context->website_url);
                });

                if ($matchedContext) {
                    Log::info("Matched context for visitor_url: {$visitorUrl} → {$matchedContext->website_url}");
                    return $matchedContext;
                }
            }

            // Try visitor_pages (check most recent page)
            if (!empty($visitorPages)) {
                $lastPage = end($visitorPages);
                $matchedContext = $contexts->first(function ($context) use ($lastPage) {
                    return $this->urlMatches($lastPage, $context->website_url);
                });

                if ($matchedContext) {
                    Log::info("Matched context for last visitor page: {$lastPage} → {$matchedContext->website_url}");
                    return $matchedContext;
                }
            }
        }

        // No fallback - if no context matched, return null
        Log::warning("No matching website context found for widget {$widget->id}");
        return null;
    }

    /**
     * Check if visitor URL matches website context URL
     */
    private function urlMatches($visitorUrl, $contextUrl)
    {
        // Normalize URLs
        $visitorDomain = parse_url($visitorUrl, PHP_URL_HOST);
        $contextDomain = parse_url($contextUrl, PHP_URL_HOST);

        // Remove www. prefix for comparison
        $visitorDomain = preg_replace('/^www\./', '', $visitorDomain);
        $contextDomain = preg_replace('/^www\./', '', $contextDomain);

        return $visitorDomain === $contextDomain;
    }

    /**
     * Analyze message for intent and sentiment
     */
    private function analyzeMessage($messageContent)
    {
        $content = strtolower($messageContent);

        // Basic intent detection
        $intent = 'general_inquiry';

        if (preg_match('/\b(price|cost|pricing|how much|pay|payment)\b/', $content)) {
            $intent = 'pricing_inquiry';
        } elseif (preg_match('/\b(buy|purchase|order|checkout)\b/', $content)) {
            $intent = 'purchase_intent';
        } elseif (preg_match('/\b(problem|issue|error|broken|not working|help)\b/', $content)) {
            $intent = 'support_request';
        } elseif (preg_match('/\b(feature|capability|can you|does it|how to)\b/', $content)) {
            $intent = 'feature_inquiry';
        }

        // Basic sentiment analysis
        $sentiment = 'neutral';
        $sentimentScore = 0.5;

        $positiveWords = ['great', 'good', 'excellent', 'thank', 'thanks', 'love', 'perfect', 'awesome'];
        $negativeWords = ['bad', 'terrible', 'awful', 'hate', 'angry', 'frustrated', 'worst', 'useless', 'disappointed'];

        $positiveCount = 0;
        $negativeCount = 0;

        foreach ($positiveWords as $word) {
            $positiveCount += substr_count($content, $word);
        }

        foreach ($negativeWords as $word) {
            $negativeCount += substr_count($content, $word);
        }

        if ($positiveCount > $negativeCount) {
            $sentiment = 'positive';
            $sentimentScore = min(1.0, 0.5 + ($positiveCount * 0.1));
        } elseif ($negativeCount > $positiveCount) {
            $sentiment = 'negative';
            $sentimentScore = max(0.0, 0.5 - ($negativeCount * 0.1));
        }

        return [
            'intent' => $intent,
            'sentiment' => $sentiment,
            'sentiment_score' => $sentimentScore,
        ];
    }

    /**
     * Check if message should trigger human escalation
     */
    private function shouldEscalateToHuman($messageContent, AiConversationContext $aiContext)
    {
        $content = strtolower($messageContent);
        $keywords = config('aiconfig.escalation.keywords', []);

        foreach ($keywords as $keyword) {
            if (strpos($content, strtolower($keyword)) !== false) {
                Log::info("Escalation keyword '{$keyword}' detected");
                return true;
            }
        }

        return false;
    }

    /**
     * Check if AI's last response offered human connection
     */
    private function aiOfferedHumanConnection(Conversation $conversation)
    {
        $lastBotMessage = $conversation->messages()
            ->where('sender_type', 'bot')
            ->orderBy('created_at', 'desc')
            ->first();

        if (!$lastBotMessage) {
            return false;
        }

        $content = strtolower($lastBotMessage->content);

        // Phrases that indicate AI offered human connection
        $offerPhrases = [
            'connect you with',
            'speak with a human',
            'talk to a human',
            'connect with a team member',
            'connect with our team',
            'notify our support team',
            'get a human agent',
            'would you like me to connect',
            'shall i connect',
            'would that help',
            'can i connect you',
            'connect you with someone',
            'speak to someone',
            'talk to someone'
        ];

        foreach ($offerPhrases as $phrase) {
            if (strpos($content, $phrase) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user message is a positive confirmation
     */
    private function isPositiveConfirmation($messageContent)
    {
        $content = strtolower(trim($messageContent));

        // Positive confirmation patterns
        $positiveResponses = [
            'yes', 'yeah', 'yep', 'yup', 'sure', 'ok', 'okay', 'alright',
            'yes please', 'yes pls', 'yeah please', 'sure thing', 'sounds good',
            'that would help', 'that would be great', 'please', 'pls', 'plz',
            'go ahead', 'proceed', 'yes thanks', 'yes thank you', 'connect me',
            'i would like that', 'i\'d like that', 'absolutely'
        ];

        foreach ($positiveResponses as $response) {
            if ($content === $response || strpos($content, $response) === 0) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check cache for similar messages
     */
    private function checkCache($messageContent, $intent)
    {
        $fingerprint = $this->generateMessageFingerprint($messageContent);

        $cached = AiResponseCache::where('message_fingerprint', $fingerprint)
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->first();

        if ($cached) {
            $cached->recordHit();
            return $cached;
        }

        return null;
    }

    /**
     * Cache AI response
     */
    private function cacheResponse($messageContent, $response, $intent)
    {
        $fingerprint = $this->generateMessageFingerprint($messageContent);
        $normalized = $this->normalizeMessage($messageContent);

        AiResponseCache::updateOrCreate(
            ['message_fingerprint' => $fingerprint],
            [
                'normalized_message' => $normalized,
                'cached_response' => $response,
                'intent' => $intent,
                'hit_count' => 1,
                'last_used_at' => now(),
                'expires_at' => now()->addSeconds(config('aiconfig.cache.ttl', 86400)),
            ]
        );
    }

    /**
     * Generate message fingerprint for caching
     */
    private function generateMessageFingerprint($message)
    {
        $normalized = $this->normalizeMessage($message);
        return md5($normalized);
    }

    /**
     * Normalize message for comparison
     */
    private function normalizeMessage($message)
    {
        $normalized = strtolower($message);
        $normalized = preg_replace('/[^a-z0-9\s]/', '', $normalized);
        $normalized = preg_replace('/\s+/', ' ', $normalized);
        return trim($normalized);
    }

    /**
     * Get or create AI context for conversation
     */
    private function getOrCreateAiContext(Conversation $conversation)
    {
        return AiConversationContext::firstOrCreate(
            ['conversation_id' => $conversation->id],
            [
                'sentiment' => 'neutral',
                'sentiment_score' => 0.5,
            ]
        );
    }

    /**
     * Get time of day for contextual greetings
     */
    private function getTimeOfDay()
    {
        $hour = now()->hour;

        if ($hour < 12) {
            return 'morning';
        } elseif ($hour < 17) {
            return 'afternoon';
        } else {
            return 'evening';
        }
    }

    /**
     * Send escalation notification to agent via all enabled channels
     *
     * @param Conversation $conversation
     * @param AiConversationContext $aiContext
     * @param string $escalationReason
     * @return void
     */
    private function notifyAgentOfEscalation(Conversation $conversation, AiConversationContext $aiContext, $escalationReason)
    {
        try {
            // Get the widget owner (agent)
            $agent = $conversation->widget->user;

            if (!$agent) {
                Log::warning("No agent found for widget {$conversation->widget_id}");
                return;
            }

            // Get global settings for throttling intervals
            $globalSettings = \App\Models\GlobalSetting::get();
            $agentWaitMinutes = $globalSettings->ai_agent_wait_minutes ?? 30;

            // Check if we already sent a notification recently (throttling)
            if ($aiContext->last_escalation_notification_at) {
                $minutesSinceLastNotification = now()->diffInMinutes($aiContext->last_escalation_notification_at);

                if ($minutesSinceLastNotification < $agentWaitMinutes) {
                    Log::info("Escalation notification throttled - last sent {$minutesSinceLastNotification} minutes ago (threshold: {$agentWaitMinutes} minutes)");
                    return; // Don't send notification, still within throttle period
                }
            }

            // Update last notification timestamp
            $aiContext->update(['last_escalation_notification_at' => now()]);

            // Load agent settings
            $agent->load('usersettings');

            // Create default settings if they don't exist
            if (!$agent->usersettings) {
                \App\Models\UserSetting::create([
                    'user_id' => $agent->id,
                    'push_enabled' => true,
                    'email_enabled' => true,
                    'sound_enabled' => true,
                ]);
                $agent->load('usersettings');
            }

            // Prepare notification messages based on escalation reason
            $reasonMessages = [
                'user_accepted_human_offer' => [
                    'title' => 'Customer Accepted Human Connection',
                    'body' => "A visitor confirmed they want to speak with a human agent. Conversation ID: {$conversation->id}",
                    'subject' => 'Human Connection Accepted - ' . config('app.name'),
                    'type' => 'success'
                ],
                'keyword_trigger' => [
                    'title' => 'Customer Requesting Human Support',
                    'body' => "A visitor has requested to speak with a human agent. Conversation ID: {$conversation->id}",
                    'subject' => 'Human Support Requested - ' . config('app.name'),
                    'type' => 'warning'
                ],
                'max_responses_reached' => [
                    'title' => 'AI Reached Maximum Responses',
                    'body' => "AI has reached the maximum response limit for conversation {$conversation->id}. Human assistance needed.",
                    'subject' => 'AI Escalation - Max Responses - ' . config('app.name'),
                    'type' => 'info'
                ],
                'frustration_detected' => [
                    'title' => 'Customer Frustration Detected',
                    'body' => "Negative sentiment detected in conversation {$conversation->id}. Visitor may need human assistance.",
                    'subject' => 'Customer Frustration Alert - ' . config('app.name'),
                    'type' => 'error'
                ],
            ];

            $notificationData = $reasonMessages[$escalationReason] ?? $reasonMessages['keyword_trigger'];

            // Add conversation context
            $notificationData['visitor_name'] = $conversation->visitor_name ?? 'Anonymous';
            $notificationData['visitor_email'] = $conversation->visitor_email ?? 'Not provided';
            $notificationData['first_message'] = $conversation->first_message;
            $notificationData['conversation_id'] = $conversation->id;
            $notificationData['widget_name'] = $conversation->widget->name ?? 'Unknown Widget';

            // Send Email Notification using EmailNotificationTrait (respects email_enabled)
            $emailMessage = [
                'response' => $notificationData['body'] . "\n\nVisitor: {$notificationData['visitor_name']}\nFirst Message: {$notificationData['first_message']}",
                'subject' => $notificationData['subject'],
                'type' => $notificationData['type'],
                'user_name' => $agent->name,
                'notify_admin' => false
            ];

            $this->ActionNotification($agent->id, $emailMessage);

            // Send Firebase + Database Notification (respects push_enabled)
            $this->sendAgentFirebaseNotification(
                $agent,
                $notificationData['title'],
                $notificationData['body'],
                'ai_escalation',
                [
                    'conversation_id' => (string)$conversation->id,
                    'escalation_reason' => $escalationReason,
                    'visitor_name' => $notificationData['visitor_name'],
                    'visitor_email' => $notificationData['visitor_email'],
                    'widget_id' => (string)$conversation->widget_id,
                    'sentiment' => $aiContext->sentiment ?? 'neutral',
                    'ai_responses_count' => (string)$aiContext->ai_responses_count,
                ]
            );

            Log::info('Agent escalation notifications processed', [
                'agent_id' => $agent->id,
                'conversation_id' => $conversation->id,
                'reason' => $escalationReason,
                'email_enabled' => $agent->usersettings->email_enabled ?? false,
                'push_enabled' => $agent->usersettings->push_enabled ?? false
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to send agent escalation notification', [
                'conversation_id' => $conversation->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }

    /**
     * Send Firebase notification to agent devices and create database notification
     *
     * @param User $agent
     * @param string $title
     * @param string $body
     * @param string $type
     * @param array $data
     * @return void
     */
    private function sendAgentFirebaseNotification($agent, $title, $body, $type, $data = [])
    {
        try {
            // Load agent settings if not already loaded
            if (!$agent->relationLoaded('usersettings')) {
                $agent->load('usersettings');
            }

            // Check if agent has push notifications enabled
            if (!$agent->usersettings || !$agent->usersettings->push_enabled) {
                Log::info("Agent {$agent->id} has push notifications disabled, skipping Firebase and database notifications");
                return;
            }

            // Create database notification (controlled by push_enabled)
            DB::table('notifications')->insert([
                'id' => (string) Str::uuid(),
                'type' => 'App\Notifications\AiEscalation',
                'notifiable_type' => 'App\Models\User',
                'notifiable_id' => $agent->id,
                'data' => json_encode(array_merge([
                    'title' => $title,
                    'body' => $body,
                ], $data)),
                'read_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            Log::info("Database notification created for agent {$agent->id}: {$type}");

            // Get all devices with FCM tokens
            $devices = $agent->devices()->whereNotNull('fcm_token')->get();

            if ($devices->isEmpty()) {
                Log::info("Agent {$agent->id} has no devices with FCM tokens, skipping Firebase notification");
                return;
            }

            $messaging = Firebase::messaging();
            $notification = Notification::create($title, $body);

            $sentCount = 0;
            $failCount = 0;

            // Send to each device
            foreach ($devices as $device) {
                try {
                    $message = CloudMessage::withTarget('token', $device->fcm_token)
                        ->withNotification($notification)
                        ->withData(array_merge([
                            'type' => $type,
                            'timestamp' => (string)now()->timestamp,
                            'sound_enabled' => (string)($agent->usersettings->sound_enabled ?? true),
                        ], array_map('strval', $data)));

                    $messaging->send($message);
                    $sentCount++;

                    // Update last_used_at
                    $device->update(['last_used_at' => now()]);

                    Log::info("Firebase escalation notification sent to agent {$agent->id} device {$device->id}");

                } catch (\Kreait\Firebase\Exception\Messaging\NotFound $e) {
                    // Token is invalid/expired, remove it
                    Log::warning("Invalid FCM token for device {$device->id}, removing");
                    $device->delete();
                    $failCount++;
                } catch (\Exception $e) {
                    Log::error("Failed to send to device {$device->id}: " . $e->getMessage());
                    $failCount++;
                }
            }

            Log::info("Firebase escalation notification summary for agent {$agent->id}: {$sentCount} sent, {$failCount} failed");

        } catch (\Exception $e) {
            Log::error('Failed to send Firebase escalation notification', [
                'agent_id' => $agent->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}
