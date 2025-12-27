<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Launch-Ready App™ | Professional App Development</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap" rel="stylesheet">
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        'sans': ['Inter', 'sans-serif'],
                        'display': ['Sora', 'sans-serif'],
                    },
                    colors: {
                        'primary': '#FF6B35',
                        'secondary': '#F7931E',
                        'dark': '#0A0E27',
                        'darker': '#060816',
                        'accent': '#4ECDC4',
                    }
                }
            }
        }
    </script>
    <style>
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #060816 0%, #0A0E27 50%, #1a1a3e 100%);
            background-attachment: fixed;
        }

        /* Glass-morphism effect */
        .glass {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glass-strong {
            background: rgba(255, 255, 255, 0.08);
            backdrop-filter: blur(30px);
            -webkit-backdrop-filter: blur(30px);
            border: 1px solid rgba(255, 255, 255, 0.15);
        }

        /* 3D Card hover effects */
        .card-3d {
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            transform-style: preserve-3d;
        }

        .card-3d:hover {
            transform: translateY(-12px) rotateX(5deg);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        /* Gradient text */
        .gradient-text {
            background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .gradient-text-blue {
            background: linear-gradient(135deg, #4ECDC4 0%, #44A3D5 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        /* Animated gradient borders */
        .gradient-border {
            position: relative;
            background: linear-gradient(135deg, rgba(255, 107, 53, 0.1), rgba(247, 147, 30, 0.1));
            border-radius: 1.5rem;
        }

        .gradient-border::before {
            content: '';
            position: absolute;
            inset: 0;
            border-radius: 1.5rem;
            padding: 2px;
            background: linear-gradient(135deg, #FF6B35, #F7931E);
            -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
            -webkit-mask-composite: xor;
            mask-composite: exclude;
            opacity: 0.5;
            transition: opacity 0.3s ease;
        }

        .gradient-border:hover::before {
            opacity: 1;
        }

        /* Glowing effects */
        .glow-orange {
            box-shadow: 0 0 40px rgba(255, 107, 53, 0.3);
        }

        .glow-orange-strong {
            box-shadow: 0 0 60px rgba(255, 107, 53, 0.5), 0 0 100px rgba(247, 147, 30, 0.3);
        }

        .glow-red {
            box-shadow: 0 0 40px rgba(239, 68, 68, 0.4);
        }

        .glow-blue {
            box-shadow: 0 0 40px rgba(78, 205, 196, 0.4);
        }

        /* Icon animations */
        .icon-float {
            transition: transform 0.4s ease;
        }

        .card-3d:hover .icon-float {
            transform: scale(1.15) translateY(-5px);
        }

        /* Pulse animation */
        @keyframes pulse-glow {
            0%, 100% {
                box-shadow: 0 0 40px rgba(255, 107, 53, 0.4);
            }
            50% {
                box-shadow: 0 0 80px rgba(255, 107, 53, 0.6), 0 0 120px rgba(247, 147, 30, 0.4);
            }
        }

        .pulse-animation {
            animation: pulse-glow 3s ease-in-out infinite;
        }

        /* Fade in animations */
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .fade-in-up {
            animation: fadeInUp 0.8s ease-out;
        }

        /* Stagger delays */
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }

        /* Video card enhancement */
        .video-card {
            transform: perspective(1000px);
            transition: all 0.5s ease;
        }

        .video-card:hover {
            transform: perspective(1000px) translateY(-10px) rotateY(2deg);
        }

        /* Process timeline connector */
        .timeline-line {
            position: relative;
        }

        .timeline-line::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 2px;
            background: linear-gradient(90deg, transparent, rgba(255, 107, 53, 0.5), transparent);
        }

        /* CTA button ripple effect */
        .ripple-button {
            position: relative;
            overflow: hidden;
        }

        .ripple-button::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            transform: translate(-50%, -50%);
            transition: width 0.6s, height 0.6s;
        }

        .ripple-button:hover::before {
            width: 300px;
            height: 300px;
        }

        /* Smooth transitions for all interactive elements */
        * {
            transition: color 0.2s ease, background-color 0.2s ease;
        }

        button, a, input, select, textarea {
            transition: all 0.3s ease;
        }
    </style>
</head>
<body class="text-white antialiased overflow-x-hidden">

    <!-- Hero Section -->
    <section class="min-h-screen flex flex-col items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
        <div class="max-w-7xl mx-auto text-center">

            <!-- Main Headline -->
            <h1 class="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight mb-6 fade-in-up">
                Your Launch-Ready App™<br>
                <span class="gradient-text">Without the Chaos</span>
            </h1>

            <!-- Subheadline -->
            <p class="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed fade-in-up delay-100">
                Expert strategy, done-for-you development, and battle-tested code
            </p>

            <!-- Video Section -->
            <div class="max-w-4xl mx-auto mb-14 fade-in-up delay-200">
                <div class="video-card relative rounded-3xl overflow-hidden glass-strong glow-orange-strong">
                    <div class="aspect-video bg-gradient-to-br from-dark to-darker relative cursor-pointer group" onclick="this.innerHTML='<iframe width=\'100%\' height=\'100%\' src=\'https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1\' frameborder=\'0\' allow=\'autoplay; encrypted-media\' allowfullscreen class=\'absolute inset-0\'></iframe>'">
                        <div class="absolute inset-0 bg-black/40"></div>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="glass px-12 py-10 rounded-2xl text-center group-hover:scale-105 transition-all">
                                <div class="text-6xl mb-4 animate-pulse">▶️</div>
                                <h3 class="text-3xl font-bold mb-2">Watch This First</h3>
                                <p class="text-lg text-gray-300">See how we build your launch-ready app</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CTA Button -->
            <a href="#contact" class="inline-block ripple-button bg-gradient-to-r from-primary to-secondary text-white font-display font-bold text-2xl md:text-3xl px-12 py-6 rounded-2xl shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:-translate-y-2 pulse-animation fade-in-up delay-300">
                Book Your Free Strategy Call
                <span class="block text-sm font-medium mt-2 opacity-90">No commitment • 20 minutes • Custom roadmap</span>
            </a>
        </div>
    </section>

    <!-- Pain Points Section -->
    <section class="px-4 py-20">
        <div class="max-w-7xl mx-auto">
            <h2 class="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 text-gray-300">
                Tired of the Same Old Story?
            </h2>
            <p class="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
                Most founders get stuck choosing between three bad options...
            </p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <!-- Pain Point 1 -->
                <div class="glass card-3d rounded-3xl p-8 text-center glow-red border-2 border-red-500/20">
                    <div class="text-6xl mb-6 icon-float">💸</div>
                    <h3 class="font-display text-2xl font-bold mb-4 text-red-400">Overpriced Agencies</h3>
                    <p class="text-gray-300 leading-relaxed">
                        $50K+ budgets, endless meetings, and months of delays. You're paying for overhead, not results.
                    </p>
                </div>

                <!-- Pain Point 2 -->
                <div class="glass card-3d rounded-3xl p-8 text-center glow-orange border-2 border-orange-500/20">
                    <div class="text-6xl mb-6 icon-float">😤</div>
                    <h3 class="font-display text-2xl font-bold mb-4 text-orange-400">Unreliable Freelancers</h3>
                    <p class="text-gray-300 leading-relaxed">
                        Junior devs who ghost you, missed deadlines, and half-finished code you can't use.
                    </p>
                </div>

                <!-- Pain Point 3 -->
                <div class="glass card-3d rounded-3xl p-8 text-center glow-orange border-2 border-yellow-500/20">
                    <div class="text-6xl mb-6 icon-float">⏰</div>
                    <h3 class="font-display text-2xl font-bold mb-4 text-yellow-400">Clunky DIY Platforms</h3>
                    <p class="text-gray-300 leading-relaxed">
                        Limited features, cookie-cutter templates, and frustrated users. Your vision deserves better.
                    </p>
                </div>
            </div>

            <!-- Transition -->
            <div class="text-center">
                <div class="inline-block glass-strong px-10 py-6 rounded-2xl glow-blue">
                    <h3 class="font-display text-3xl md:text-4xl font-bold gradient-text-blue">
                        There's a Better Way →
                    </h3>
                </div>
            </div>
        </div>
    </section>

    <!-- Solution Section: 3 Pillars -->
    <section class="px-4 py-20">
        <div class="max-w-7xl mx-auto">
            <h2 class="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-8 gradient-text">
                The Launch-Ready App™ Difference
            </h2>
            <p class="text-xl text-gray-400 text-center mb-16 max-w-3xl mx-auto">
                Built for coaches, consultants, and online service providers who need results, not excuses
            </p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Pillar 1: Speed -->
                <div class="gradient-border glass-strong card-3d rounded-3xl p-10 text-center">
                    <div class="text-7xl mb-6 icon-float">⚡</div>
                    <h3 class="font-display text-3xl font-bold mb-4 gradient-text">SPEED</h3>
                    <p class="text-5xl font-bold mb-4 text-white">30-45 Days</p>
                    <p class="text-gray-300 text-lg leading-relaxed">
                        From strategy call to launch-ready app. No 6-month delays. No excuses.
                    </p>
                </div>

                <!-- Pillar 2: Complete -->
                <div class="gradient-border glass-strong card-3d rounded-3xl p-10 text-center">
                    <div class="text-7xl mb-6 icon-float">✅</div>
                    <h3 class="font-display text-3xl font-bold mb-4 gradient-text">COMPLETE</h3>
                    <p class="text-2xl font-bold mb-4 text-white">iOS + Android + Web</p>
                    <p class="text-gray-300 text-lg leading-relaxed">
                        Full-stack solution with admin dashboard, automation, and everything you need to succeed.
                    </p>
                </div>

                <!-- Pillar 3: Reliable -->
                <div class="gradient-border glass-strong card-3d rounded-3xl p-10 text-center">
                    <div class="text-7xl mb-6 icon-float">🛡️</div>
                    <h3 class="font-display text-3xl font-bold mb-4 gradient-text">RELIABLE</h3>
                    <p class="text-4xl font-bold mb-4 text-white">24-48 Hour Response</p>
                    <p class="text-gray-300 text-lg leading-relaxed">
                        No ghosting. No radio silence. Real accountability with guaranteed response times.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- What You Get Section -->
    <section class="px-4 py-20">
        <div class="max-w-7xl mx-auto">
            <h2 class="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-16 gradient-text">
                Everything You Need to Launch
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Feature 1 -->
                <div class="glass card-3d rounded-2xl p-8 border border-secondary/20">
                    <div class="text-5xl mb-5 icon-float">🎯</div>
                    <h3 class="font-display text-2xl font-bold mb-3 text-secondary">Strategy & Wireframing</h3>
                    <p class="text-gray-300 leading-relaxed">
                        Deep-dive discovery session to map your vision, identify key features, and create a battle-tested roadmap.
                    </p>
                </div>

                <!-- Feature 2 -->
                <div class="glass card-3d rounded-2xl p-8 border border-secondary/20">
                    <div class="text-5xl mb-5 icon-float">📱</div>
                    <h3 class="font-display text-2xl font-bold mb-3 text-secondary">Cross-Platform Build</h3>
                    <p class="text-gray-300 leading-relaxed">
                        iOS, Android, and web—all from one codebase. Your users get native performance everywhere.
                    </p>
                </div>

                <!-- Feature 3 -->
                <div class="glass card-3d rounded-2xl p-8 border border-secondary/20">
                    <div class="text-5xl mb-5 icon-float">⚙️</div>
                    <h3 class="font-display text-2xl font-bold mb-3 text-secondary">Admin Dashboard</h3>
                    <p class="text-gray-300 leading-relaxed">
                        Complete control panel to manage users, content, payments, and analytics—no coding required.
                    </p>
                </div>

                <!-- Feature 4 -->
                <div class="glass card-3d rounded-2xl p-8 border border-secondary/20">
                    <div class="text-5xl mb-5 icon-float">🔄</div>
                    <h3 class="font-display text-2xl font-bold mb-3 text-secondary">Automation Setup</h3>
                    <p class="text-gray-300 leading-relaxed">
                        Email sequences, payment processing, user onboarding—all automated so you can focus on growth.
                    </p>
                </div>

                <!-- Feature 5 -->
                <div class="glass card-3d rounded-2xl p-8 border border-secondary/20">
                    <div class="text-5xl mb-5 icon-float">🚀</div>
                    <h3 class="font-display text-2xl font-bold mb-3 text-secondary">Launch-Ready Deployment</h3>
                    <p class="text-gray-300 leading-relaxed">
                        Fully prepared app packages (APK/IPA), app store assets, and comprehensive launch documentation.
                    </p>
                </div>

                <!-- Feature 6 -->
                <div class="glass card-3d rounded-2xl p-8 border border-secondary/20">
                    <div class="text-5xl mb-5 icon-float">🛠️</div>
                    <h3 class="font-display text-2xl font-bold mb-3 text-secondary">60-Day Support</h3>
                    <p class="text-gray-300 leading-relaxed">
                        Post-launch bug fixes, tweaks, and training so you're fully confident running your app.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- Social Proof: 100+ Apps Stat -->
    <section class="px-4 py-20">
        <div class="max-w-5xl mx-auto text-center">
            <div class="glass-strong rounded-3xl p-12 md:p-16 glow-orange-strong border-2 border-secondary/30">
                <div class="font-display text-6xl sm:text-7xl md:text-8xl font-extrabold gradient-text mb-6">100+</div>
                <p class="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Apps Successfully Delivered</p>
                <p class="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
                    For coaches, consultants, and entrepreneurs who needed apps that actually work
                </p>
            </div>
        </div>
    </section>

    <!-- Testimonials Section -->
    <section class="px-4 py-20">
        <div class="max-w-7xl mx-auto">
            <h2 class="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-16 gradient-text">
                What Clients Say
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Testimonial 1 -->
                <div class="glass card-3d rounded-2xl p-8 border-l-4 border-secondary">
                    <div class="flex gap-1 mb-4">
                        <span class="text-2xl">⭐</span>
                        <span class="text-2xl">⭐</span>
                        <span class="text-2xl">⭐</span>
                        <span class="text-2xl">⭐</span>
                        <span class="text-2xl">⭐</span>
                    </div>
                    <p class="text-lg text-gray-200 italic leading-relaxed mb-6">
                        "Finally, a developer who delivers on time. The app is beautiful, works perfectly, and our members love it."
                    </p>
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold">
                            S
                        </div>
                        <div>
                            <p class="font-bold text-secondary">Sarah M.</p>
                            <p class="text-sm text-gray-400">Course Creator</p>
                        </div>
                    </div>
                </div>

                <!-- Testimonial 2 -->
                <div class="glass card-3d rounded-2xl p-8 border-l-4 border-secondary">
                    <div class="flex gap-1 mb-4">
                        <span class="text-2xl">⭐</span>
                        <span class="text-2xl">⭐</span>
                        <span class="text-2xl">⭐</span>
                        <span class="text-2xl">⭐</span>
                        <span class="text-2xl">⭐</span>
                    </div>
                    <p class="text-lg text-gray-200 italic leading-relaxed mb-6">
                        "I was skeptical about the 45-day timeline, but they actually delivered early. The quality is incredible."
                    </p>
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold">
                            J
                        </div>
                        <div>
                            <p class="font-bold text-secondary">James K.</p>
                            <p class="text-sm text-gray-400">Business Coach</p>
                        </div>
                    </div>
                </div>

                <!-- Testimonial 3 -->
                <div class="glass card-3d rounded-2xl p-8 border-l-4 border-secondary">
                    <div class="flex gap-1 mb-4">
                        <span class="text-2xl">⭐</span>
                        <span class="text-2xl">⭐</span>
                        <span class="text-2xl">⭐</span>
                        <span class="text-2xl">⭐</span>
                        <span class="text-2xl">⭐</span>
                    </div>
                    <p class="text-lg text-gray-200 italic leading-relaxed mb-6">
                        "After wasting months with freelancers, this was a breath of fresh air. Professional, responsive, and worth every penny."
                    </p>
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold">
                            M
                        </div>
                        <div>
                            <p class="font-bold text-secondary">Michael R.</p>
                            <p class="text-sm text-gray-400">Consultant</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Process Section -->
    <section class="px-4 py-20">
        <div class="max-w-7xl mx-auto">
            <h2 class="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-16 gradient-text">
                How It Works
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                <!-- Timeline connector line (hidden on mobile) -->
                <div class="hidden lg:block absolute top-20 left-0 right-0 timeline-line"></div>

                <!-- Step 1 -->
                <div class="relative glass-strong card-3d rounded-2xl p-8 text-center border-2 border-secondary/30">
                    <div class="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center font-display text-2xl font-bold shadow-lg z-10">
                        1
                    </div>
                    <h3 class="font-display text-2xl font-bold mt-6 mb-4 text-secondary">Strategy Call</h3>
                    <p class="text-gray-300 leading-relaxed">
                        20-minute discovery call to understand your vision and create a custom roadmap
                    </p>
                </div>

                <!-- Step 2 -->
                <div class="relative glass-strong card-3d rounded-2xl p-8 text-center border-2 border-secondary/30">
                    <div class="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center font-display text-2xl font-bold shadow-lg z-10">
                        2
                    </div>
                    <h3 class="font-display text-2xl font-bold mt-6 mb-4 text-secondary">Wireframe</h3>
                    <p class="text-gray-300 leading-relaxed">
                        See exactly what your app will look like before a single line of code is written
                    </p>
                </div>

                <!-- Step 3 -->
                <div class="relative glass-strong card-3d rounded-2xl p-8 text-center border-2 border-secondary/30">
                    <div class="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center font-display text-2xl font-bold shadow-lg z-10">
                        3
                    </div>
                    <h3 class="font-display text-2xl font-bold mt-6 mb-4 text-secondary">Build</h3>
                    <p class="text-gray-300 leading-relaxed">
                        We develop your app with regular updates so you're never left in the dark
                    </p>
                </div>

                <!-- Step 4 -->
                <div class="relative glass-strong card-3d rounded-2xl p-8 text-center border-2 border-secondary/30">
                    <div class="absolute -top-6 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center font-display text-2xl font-bold shadow-lg z-10">
                        4
                    </div>
                    <h3 class="font-display text-2xl font-bold mt-6 mb-4 text-secondary">Launch</h3>
                    <p class="text-gray-300 leading-relaxed">
                        We deploy to app stores and provide 60 days of support to ensure success
                    </p>
                </div>
            </div>
        </div>
    </section>

    <!-- Final CTA Section -->
    <section class="px-4 py-24" id="contact">
        <div class="max-w-4xl mx-auto">
            <div class="glass-strong rounded-3xl p-8 md:p-12 lg:p-16 border-2 border-primary/30 text-center glow-orange-strong">
                <h2 class="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
                    Ready to Build Your<br>
                    <span class="gradient-text">Launch-Ready App?</span>
                </h2>

                <p class="text-base sm:text-lg md:text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
                    Book your free 20-minute strategy call and get a custom roadmap for your app
                </p>

                <div class="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8 text-sm sm:text-base">
                    <div class="flex items-center gap-2">
                        <span class="text-xl">✓</span>
                        <span class="text-gray-300">No commitment</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xl">✓</span>
                        <span class="text-gray-300">20 minutes</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="text-xl">✓</span>
                        <span class="text-gray-300">Custom roadmap</span>
                    </div>
                </div>

                <!-- Contact Form -->
                <div class="max-w-xl mx-auto glass rounded-2xl p-6 md:p-8 border border-secondary/20">
                    <form action="YOUR_FORM_HANDLER" method="POST" class="space-y-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="text-left">
                                <label for="name" class="block text-xs font-semibold mb-1.5 text-gray-200">Your Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="John Doe"
                                    class="w-full px-4 py-2.5 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-secondary focus:outline-none">
                            </div>

                            <div class="text-left">
                                <label for="email" class="block text-xs font-semibold mb-1.5 text-gray-200">Email Address *</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    placeholder="john@example.com"
                                    class="w-full px-4 py-2.5 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-secondary focus:outline-none">
                            </div>
                        </div>

                        <div class="text-left">
                            <label for="phone" class="block text-xs font-semibold mb-1.5 text-gray-200">Phone Number</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                placeholder="+1 (555) 123-4567"
                                class="w-full px-4 py-2.5 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-secondary focus:outline-none">
                        </div>

                        <div class="text-left">
                            <label for="details" class="block text-xs font-semibold mb-1.5 text-gray-200">Tell us about your app idea *</label>
                            <textarea
                                id="details"
                                name="details"
                                required
                                rows="4"
                                placeholder="What kind of app do you want to build? Who is it for? What problem does it solve?"
                                class="w-full px-4 py-2.5 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-secondary focus:outline-none resize-none"></textarea>
                        </div>

                        <button
                            type="submit"
                            class="w-full ripple-button bg-gradient-to-r from-primary to-secondary text-white font-display font-bold text-base sm:text-lg px-6 py-3 rounded-lg shadow-xl hover:shadow-primary/50 transition-all duration-300 hover:-translate-y-1">
                            BOOK MY FREE STRATEGY CALL →
                        </button>

                        <p class="text-xs text-gray-400 text-center">
                            We'll respond within 24 hours to schedule your call
                        </p>
                    </form>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="px-4 py-12 text-center text-gray-400 border-t border-white/5">
        <p class="text-base mb-2">&copy; 2024 Launch-Ready App™ | Professional App Development</p>
        <p class="text-sm">Building apps for coaches, consultants, and online service providers</p>
    </footer>

    <script>
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Form submission handler
        const form = document.querySelector('form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();

                // Integrate with your backend or email service
                alert('Thank you for booking! We\'ll email you within 24 hours to schedule your strategy call.');
                this.reset();
            });
        }

        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);

        // Observe all sections for scroll animations
        document.querySelectorAll('section').forEach((section, index) => {
            if (index > 0) { // Skip hero section
                section.style.opacity = '0';
                section.style.transform = 'translateY(30px)';
                section.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
                observer.observe(section);
            }
        });

        // Stagger animation for cards within sections
        const observerCards = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const cards = entry.target.querySelectorAll('.card-3d');
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                }
            });
        }, observerOptions);

        document.querySelectorAll('section').forEach(section => {
            if (section.querySelectorAll('.card-3d').length > 0) {
                observerCards.observe(section);
                section.querySelectorAll('.card-3d').forEach(card => {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    card.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
                });
            }
        });
    </script>
</body>
</html>
