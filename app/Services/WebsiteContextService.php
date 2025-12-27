<?php

namespace App\Services;

use App\Models\Widget;
use App\Models\WidgetWebsiteContext;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Exception;

class WebsiteContextService
{
    /**
     * Scrape website and extract context for AI
     */
    public function scrapeWebsite(Widget $widget)
    {
        try {
            $websiteUrl = $widget->website;

            if (empty($websiteUrl)) {
                Log::warning("Widget {$widget->id} has no website URL");
                return null;
            }

            // Normalize URL
            $websiteUrl = $this->normalizeUrl($websiteUrl);

            Log::info("Starting website scrape for widget {$widget->id}: {$websiteUrl}");

            // Fetch the main page
            $mainContent = $this->fetchPage($websiteUrl);

            if (!$mainContent) {
                $this->recordScrapeFailure($widget, 'Failed to fetch main page');
                return null;
            }

            // Extract relevant information
            $context = [
                'about_content' => $this->extractAboutContent($mainContent, $websiteUrl),
                'products_services' => $this->extractProductsServices($mainContent),
                'faq_data' => $this->extractFAQ($mainContent),
                'contact_info' => $this->extractContactInfo($mainContent),
                'pricing_info' => $this->extractPricingInfo($mainContent),
                'meta_description' => $this->extractMetaDescription($mainContent),
                'key_features' => $this->extractKeyFeatures($mainContent),
                'full_context' => $this->buildFullContext($mainContent),
            ];

            // Create or update website context
            $websiteContext = WidgetWebsiteContext::updateOrCreate(
                ['widget_id' => $widget->id],
                [
                    'website_url' => $websiteUrl,
                    'about_content' => $context['about_content'],
                    'products_services' => $context['products_services'],
                    'faq_data' => $context['faq_data'],
                    'contact_info' => $context['contact_info'],
                    'pricing_info' => $context['pricing_info'],
                    'meta_description' => $context['meta_description'],
                    'key_features' => $context['key_features'],
                    'full_context' => $context['full_context'],
                    'is_active' => true,
                    'scrape_status' => 'success',
                    'scrape_error' => null,
                    'last_scraped_at' => now(),
                    'next_scrape_at' => now()->addDays(config('aiconfig.scraping.frequency_days', 7)),
                ]
            );

            Log::info("Successfully scraped website for widget {$widget->id}");

            return $websiteContext;

        } catch (Exception $e) {
            Log::error("Website scrape failed for widget {$widget->id}: " . $e->getMessage());
            $this->recordScrapeFailure($widget, $e->getMessage());
            return null;
        }
    }

    /**
     * Fetch a page with timeout and error handling
     */
    private function fetchPage($url)
    {
        try {
            $response = Http::timeout(config('aiconfig.scraping.timeout', 30))
                ->withHeaders([
                    'User-Agent' => config('aiconfig.scraping.user_agent'),
                ])
                ->get($url);

            if ($response->successful()) {
                return $response->body();
            }

            Log::warning("Failed to fetch {$url}: HTTP {$response->status()}");
            return null;

        } catch (Exception $e) {
            Log::error("Error fetching {$url}: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Extract about/description content
     */
    private function extractAboutContent($html, $baseUrl)
    {
        // Try to find about section or main description
        $patterns = [
            '/<section[^>]*about[^>]*>(.*?)<\/section>/is',
            '/<div[^>]*about[^>]*>(.*?)<\/div>/is',
            '/<p[^>]*class="[^"]*description[^"]*"[^>]*>(.*?)<\/p>/is',
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $html, $matches)) {
                return $this->cleanText($matches[1]);
            }
        }

        // Fallback: get first few paragraphs
        if (preg_match_all('/<p[^>]*>(.*?)<\/p>/is', $html, $matches)) {
            $paragraphs = array_slice($matches[1], 0, 3);
            return $this->cleanText(implode(' ', $paragraphs));
        }

        return null;
    }

    /**
     * Extract products/services information
     */
    private function extractProductsServices($html)
    {
        $products = [];

        // Look for product/service listings
        if (preg_match_all('/<(?:h[2-4]|div)[^>]*(?:product|service)[^>]*>(.*?)<\/(?:h[2-4]|div)>/is', $html, $matches)) {
            foreach ($matches[1] as $match) {
                $cleaned = $this->cleanText($match);
                if (!empty($cleaned) && strlen($cleaned) < 200) {
                    $products[] = $cleaned;
                }
            }
        }

        return array_unique(array_slice($products, 0, 10));
    }

    /**
     * Extract FAQ data
     */
    private function extractFAQ($html)
    {
        $faqs = [];

        // Look for FAQ patterns
        if (preg_match_all('/<(?:dt|h[3-5])[^>]*>(.*?)<\/(?:dt|h[3-5])>\s*<(?:dd|p|div)[^>]*>(.*?)<\/(?:dd|p|div)>/is', $html, $matches, PREG_SET_ORDER)) {
            foreach ($matches as $match) {
                $question = $this->cleanText($match[1]);
                $answer = $this->cleanText($match[2]);

                if (!empty($question) && !empty($answer)) {
                    $faqs[] = [
                        'question' => $question,
                        'answer' => $answer,
                    ];
                }
            }
        }

        return array_slice($faqs, 0, 10);
    }

    /**
     * Extract contact information
     */
    private function extractContactInfo($html)
    {
        $contact = [];

        // Email
        if (preg_match('/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/', $html, $matches)) {
            $contact['email'] = $matches[0];
        }

        // Phone
        if (preg_match('/(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/', $html, $matches)) {
            $contact['phone'] = $matches[0];
        }

        return !empty($contact) ? $contact : null;
    }

    /**
     * Extract pricing information
     */
    private function extractPricingInfo($html)
    {
        $pricing = [];

        // Look for price patterns
        if (preg_match_all('/\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:\/\s*(\w+))?/i', $html, $matches, PREG_SET_ORDER)) {
            foreach (array_slice($matches, 0, 5) as $match) {
                $pricing[] = [
                    'amount' => $match[1],
                    'period' => $match[2] ?? null,
                ];
            }
        }

        return !empty($pricing) ? $pricing : null;
    }

    /**
     * Extract meta description
     */
    private function extractMetaDescription($html)
    {
        if (preg_match('/<meta[^>]*name=["\']description["\'][^>]*content=["\'](.*?)["\']/i', $html, $matches)) {
            return $this->cleanText($matches[1]);
        }

        return null;
    }

    /**
     * Extract key features
     */
    private function extractKeyFeatures($html)
    {
        $features = [];

        // Look for feature lists
        if (preg_match_all('/<li[^>]*>(.*?)<\/li>/is', $html, $matches)) {
            foreach ($matches[1] as $match) {
                $cleaned = $this->cleanText($match);
                if (!empty($cleaned) && strlen($cleaned) < 150 && strlen($cleaned) > 10) {
                    $features[] = $cleaned;
                }
            }
        }

        return array_unique(array_slice($features, 0, 10));
    }

    /**
     * Build comprehensive context for AI
     */
    private function buildFullContext($html)
    {
        // Strip tags and clean
        $text = strip_tags($html);
        $text = preg_replace('/\s+/', ' ', $text);
        $text = trim($text);

        // Limit to reasonable size (first 5000 chars)
        return mb_substr($text, 0, 5000);
    }

    /**
     * Clean extracted text
     */
    private function cleanText($text)
    {
        $text = strip_tags($text);
        $text = html_entity_decode($text, ENT_QUOTES, 'UTF-8');
        $text = preg_replace('/\s+/', ' ', $text);
        return trim($text);
    }

    /**
     * Normalize URL
     */
    private function normalizeUrl($url)
    {
        if (!preg_match('/^https?:\/\//i', $url)) {
            $url = 'https://' . $url;
        }

        return rtrim($url, '/');
    }

    /**
     * Record scrape failure
     */
    private function recordScrapeFailure(Widget $widget, $error)
    {
        WidgetWebsiteContext::updateOrCreate(
            ['widget_id' => $widget->id],
            [
                'website_url' => $widget->website,
                'scrape_status' => 'failed',
                'scrape_error' => $error,
                'next_scrape_at' => now()->addDay(), // Retry tomorrow
            ]
        );
    }
}
