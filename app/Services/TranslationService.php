<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

class TranslationService
{
    private $translator;
    private $isAvailable = false;

    public function __construct()
    {
        // Check if Google Translate package is installed
        if (class_exists(\Stichoza\GoogleTranslate\GoogleTranslate::class)) {
            $this->translator = new \Stichoza\GoogleTranslate\GoogleTranslate();
            $this->isAvailable = true;
        } else {
            Log::warning('Google Translate package not installed. Translation disabled. Run: composer require stichoza/google-translate-php');
        }
    }

    /**
     * Add translation watermark to message
     */
    private function addWatermark(string $text, string $sourceLang, string $targetLang): string
    {
        // Create watermark in target language
        $watermarkTemplate = "Translated from {CODE}";
        $watermark = str_replace('{CODE}', strtoupper($sourceLang), $watermarkTemplate);

        // If target is English, use English watermark
        if ($targetLang === 'en') {
            return $text . " [" . $watermark . "]";
        }

        // Translate "Translated from" to target language
        try {
            $this->translator->setSource('en');
            $this->translator->setTarget($targetLang);
            $translatedPrefix = $this->translator->translate("Translated from");
            $watermark = $translatedPrefix . " " . strtoupper($sourceLang);
        } catch (\Exception $e) {
            // Fallback to English if translation fails
            $watermark = "Translated from " . strtoupper($sourceLang);
        }

        return $text . " [" . $watermark . "]";
    }

    /**
     * Detect the language of a given text
     *
     * @param string $text
     * @return string|null Language code (e.g., 'en', 'es', 'fr') or null on failure
     */
    public function detectLanguage(string $text): ?string
    {
        if (!$this->isAvailable) {
            return 'en'; // Default to English if translator not available
        }

        try {
            // Remove empty lines and trim
            $text = trim($text);

            if (empty($text)) {
                return null;
            }

            // Detect language by translating to English and checking source
            $this->translator->setSource(null); // Auto-detect
            $this->translator->setTarget('en');
            $this->translator->translate($text);

            // Get detected language
            $detectedLang = $this->translator->getLastDetectedSource();

            Log::info('Language detected', [
                'text_preview' => substr($text, 0, 50),
                'detected_language' => $detectedLang
            ]);

            return $detectedLang;
        } catch (\Exception $e) {
            Log::error('Language detection failed: ' . $e->getMessage(), [
                'text_preview' => substr($text, 0, 50)
            ]);
            return 'en'; // Default to English on error
        }
    }

    /**
     * Translate text from one language to another
     *
     * @param string $text Text to translate
     * @param string $targetLang Target language code (e.g., 'en', 'es')
     * @param string|null $sourceLang Source language code (auto-detect if null)
     * @return string|null Translated text or null on failure
     */
    public function translate(string $text, string $targetLang, ?string $sourceLang = null): ?string
    {
        if (!$this->isAvailable) {
            return $text; // Return original text if translator not available
        }

        try {
            // Remove empty lines and trim
            $text = trim($text);

            if (empty($text)) {
                return $text;
            }

            // Set source language if provided
            if ($sourceLang) {
                $this->translator->setSource($sourceLang);
            } else {
                $this->translator->setSource(); // Auto-detect
            }

            // Set target language
            $this->translator->setTarget($targetLang);

            // Translate
            $translatedText = $this->translator->translate($text);

            Log::info('Text translated', [
                'from' => $sourceLang ?? 'auto',
                'to' => $targetLang,
                'original_preview' => substr($text, 0, 50),
                'translated_preview' => substr($translatedText, 0, 50)
            ]);

            return $translatedText;
        } catch (\Exception $e) {
            Log::error('Translation failed: ' . $e->getMessage(), [
                'from' => $sourceLang ?? 'auto',
                'to' => $targetLang,
                'text_preview' => substr($text, 0, 50)
            ]);

            // Return original text if translation fails
            return $text;
        }
    }

    /**
     * Translate visitor message to English
     * If language is already English, return original text
     *
     * @param string $text
     * @param string|null $visitorLanguage
     * @return array ['text' => translated text, 'detected_language' => language code]
     */
    public function translateVisitorToEnglish(string $text, ?string $visitorLanguage = null): array
    {
        if (!$this->isAvailable) {
            return [
                'text' => $text,
                'detected_language' => 'en'
            ];
        }

        try {
            $text = trim($text);

            if (empty($text)) {
                return [
                    'text' => $text,
                    'detected_language' => 'en'
                ];
            }

            // Clean visitor language if it's browser header format (e.g., "ro-RO,ro;q=0.9")
            if ($visitorLanguage && strpos($visitorLanguage, ',') !== false) {
                // Extract first language code
                $parts = explode(',', $visitorLanguage);
                $visitorLanguage = explode('-', $parts[0])[0]; // Get 'ro' from 'ro-RO'
            } elseif ($visitorLanguage && strpos($visitorLanguage, '-') !== false) {
                // Convert 'ro-RO' to 'ro'
                $visitorLanguage = explode('-', $visitorLanguage)[0];
            }

            // Set source language (auto-detect if not provided or not valid)
            $this->translator->setSource($visitorLanguage ?: null);
            $this->translator->setTarget('en');

            // Translate
            $translatedText = $this->translator->translate($text);

            // Get detected language
            $detectedLang = $this->translator->getLastDetectedSource();

            // If already English, return original
            if ($detectedLang === 'en') {
                return [
                    'text' => $text,
                    'detected_language' => 'en'
                ];
            }

            // Add watermark to translated text
            $translatedTextWithWatermark = $this->addWatermark($translatedText, $detectedLang, 'en');

            Log::info('Visitor message translated to English', [
                'detected_language' => $detectedLang,
                'original_preview' => substr($text, 0, 50),
                'translated_preview' => substr($translatedText, 0, 50)
            ]);

            return [
                'text' => $translatedTextWithWatermark ?? $text,
                'detected_language' => $detectedLang
            ];
        } catch (\Exception $e) {
            Log::error('Visitor to English translation failed: ' . $e->getMessage());

            return [
                'text' => $text,
                'detected_language' => 'en' // Default to English on error
            ];
        }
    }

    /**
     * Translate agent message to visitor's language
     * If visitor language is English, return original text
     *
     * @param string $text
     * @param string $visitorLanguage
     * @return string Translated text
     */
    public function translateAgentToVisitor(string $text, string $visitorLanguage): string
    {
        if (!$this->isAvailable) {
            return $text;
        }

        try {
            $text = trim($text);

            if (empty($text)) {
                return $text;
            }

            // Clean visitor language if it's browser header format
            if (strpos($visitorLanguage, ',') !== false) {
                $parts = explode(',', $visitorLanguage);
                $visitorLanguage = explode('-', $parts[0])[0];
            } elseif (strpos($visitorLanguage, '-') !== false) {
                $visitorLanguage = explode('-', $visitorLanguage)[0];
            }

            // If visitor speaks English, no need to translate
            if ($visitorLanguage === 'en' || empty($visitorLanguage)) {
                return $text;
            }

            // Translate from English to visitor's language
            $this->translator->setSource('en');
            $this->translator->setTarget($visitorLanguage);
            $translatedText = $this->translator->translate($text);

            // Add watermark to translated text
            $translatedTextWithWatermark = $this->addWatermark($translatedText, 'en', $visitorLanguage);

            Log::info('Agent message translated to visitor language', [
                'target_language' => $visitorLanguage,
                'original_preview' => substr($text, 0, 50),
                'translated_preview' => substr($translatedText, 0, 50)
            ]);

            return $translatedTextWithWatermark ?? $text;
        } catch (\Exception $e) {
            Log::error('Agent to visitor translation failed: ' . $e->getMessage(), [
                'target_language' => $visitorLanguage ?? 'unknown'
            ]);

            // Return original text if translation fails
            return $text;
        }
    }
}
