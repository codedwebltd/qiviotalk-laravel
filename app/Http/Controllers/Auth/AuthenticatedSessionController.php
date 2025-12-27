<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Providers\RouteServiceProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;
use App\Events\UserLoggedIn;
use App\Services\NewConversationService;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): View
    {
        return view('auth.login');
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        // Broadcast user logged in event (WebSocket)
        broadcast(new UserLoggedIn(auth()->user()));

        // Send FCM force logout to other devices
        //app(NewConversationService::class)->forceLogoutOtherDevices(auth()->user());

        // Redirect admin users to admin dashboard
        if (auth()->user()->role === 1) {
            return redirect()->intended('/admin');
        }

        return redirect()->intended(RouteServiceProvider::HOME);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        // Hard redirect to login page
        return redirect('/login');
    }
}
