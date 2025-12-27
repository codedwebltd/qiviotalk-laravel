<?php

namespace Database\Seeders;

use App\Models\WidgetWebsiteContext;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class WidgetWebsiteContextSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Update existing Westernkits website context with complete information
        $context = WidgetWebsiteContext::where('widget_id', 1)->first();

        if ($context) {
            $context->update([
                'products_services' => [
                    'Remote Desktop Access (RDP)',
                    'Secure Connection Tools (VPN)',
                    'Software Licenses (Instant Delivery)',
                    'cPanel & WHM Licenses',
                    'Windows Server Licenses',
                    'Digital Solutions & Tools'
                ],
                'faq_data' => [
                    [
                        'question' => 'How quickly will I receive my software license?',
                        'answer' => 'All software licenses are delivered instantly and securely upon successful payment completion. You will receive your license details via email within minutes.'
                    ],
                    [
                        'question' => 'What payment methods do you accept?',
                        'answer' => 'We accept cryptocurrency payments through our secure payment gateway powered by Cryptomus. This includes Bitcoin, Ethereum, Litecoin, and other major cryptocurrencies.'
                    ],
                    [
                        'question' => 'Do you offer customer support?',
                        'answer' => 'Yes! We provide 24/7 customer support through our live chat system. Our team is available to help with any questions about our products, licenses, or technical issues.'
                    ],
                    [
                        'question' => 'Can I get a refund if I\'m not satisfied?',
                        'answer' => 'Due to the instant digital nature of our products, refunds are handled on a case-by-case basis. Please contact our support team if you encounter any issues with your purchase.'
                    ],
                    [
                        'question' => 'Are your licenses genuine and legal?',
                        'answer' => 'Absolutely! All licenses provided by Westernkits are 100% genuine, legal, and sourced from authorized distributors. We guarantee authenticity for all our products.'
                    ],
                    [
                        'question' => 'How do I access my purchased licenses?',
                        'answer' => 'After payment confirmation, you can access your licenses from your account dashboard. You\'ll also receive detailed instructions via email on how to activate and use your license.'
                    ],
                    [
                        'question' => 'Do you offer bulk discounts?',
                        'answer' => 'Yes! For bulk orders and enterprise solutions, please contact our sales team through the live chat or email. We offer competitive pricing for large volume purchases.'
                    ],
                    [
                        'question' => 'What is your mobile app for?',
                        'answer' => 'Our mobile app (available at https://bit.ly/4pxisPP) allows you to manage your licenses, track orders, chat with support, and receive instant notifications about your purchases - all on the go!'
                    ]
                ],
                'contact_info' => [
                    'Website: https://westernkits.com',
                    'Mobile App: https://bit.ly/4pxisPP',
                    'Email: support@westernkits.com',
                    'Live Chat: Available 24/7 on website',
                    'Support Hours: 24/7 Customer Support'
                ],
                'pricing_info' => [
                    [
                        'category' => 'Remote Desktop (RDP)',
                        'starting_price' => 'Starting from $15/month',
                        'note' => 'Prices vary based on specifications and duration'
                    ],
                    [
                        'category' => 'VPN Services',
                        'starting_price' => 'Starting from $9.99/month',
                        'note' => 'Multiple server locations available'
                    ],
                    [
                        'category' => 'Software Licenses',
                        'starting_price' => 'Varies by product',
                        'note' => 'Contact support for specific pricing'
                    ],
                    [
                        'category' => 'cPanel/WHM Licenses',
                        'starting_price' => 'Starting from $12.99/month',
                        'note' => 'Instant activation included'
                    ],
                    [
                        'note' => 'All prices in USD. Cryptocurrency payments accepted. Contact support for bulk discounts and enterprise pricing.'
                    ]
                ],
                'key_features' => [
                    'Instant Digital Delivery',
                    'Secure Cryptocurrency Payments',
                    '24/7 Customer Support',
                    '100% Genuine Licenses',
                    'Mobile App Access',
                    'Account Dashboard Management',
                    'Email & Push Notifications',
                    'Multiple Product Categories',
                    'Bulk Order Discounts',
                    'Enterprise Solutions Available'
                ],
                'meta_description' => 'Westernkits - Premium Digital Solutions with Instant Delivery. Get remote desktop access, secure VPN connections, and genuine software licenses delivered instantly. 24/7 support, cryptocurrency payments accepted.',
                'full_context' => $context->full_context . "\n\nWesternkits specializes in providing premium digital solutions including Remote Desktop Access (RDP), VPN services, software licenses, cPanel/WHM licenses, and various digital tools. All products are delivered instantly upon payment confirmation.\n\nKey Information:\n- Company Name: Westernkits\n- Industry: SaaS / Digital Solutions Provider\n- Website: https://westernkits.com\n- Mobile App: https://bit.ly/4pxisPP\n- Payment Methods: Cryptocurrency (Bitcoin, Ethereum, Litecoin, etc.)\n- Support: 24/7 Live Chat & Email Support\n- Delivery: Instant digital delivery\n- Product Authenticity: 100% genuine and legal licenses\n\nProducts & Services:\n1. Remote Desktop Access (RDP) - Starting from $15/month\n2. VPN Services - Starting from $9.99/month\n3. Software Licenses - Various products available\n4. cPanel & WHM Licenses - Starting from $12.99/month\n5. Windows Server Licenses\n6. Custom Digital Solutions\n\nWhat Makes Westernkits Different:\n- Instant delivery upon payment\n- Secure cryptocurrency payments\n- Genuine, legal licenses only\n- 24/7 customer support\n- Mobile app for easy management\n- Competitive bulk pricing\n\nImportant Notes for Support:\n- Never provide fake contact information\n- Always direct users to verified channels (website, mobile app)\n- For specific pricing, direct to support team\n- For order inquiries, always escalate to human agent\n- For account-specific questions, connect with human support",
                'scrape_status' => 'success',
                'last_scraped_at' => now(),
            ]);

            $this->command->info('✅ Westernkits website context updated successfully!');
        } else {
            $this->command->warn('⚠️  No website context found for widget_id = 1');
        }
    }
}
