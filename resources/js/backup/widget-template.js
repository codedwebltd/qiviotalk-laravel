// Save this file to resources/js/widget-template.js
(function () {

  // First, dynamically load the Pusher script
  const loadPusher = () => {
    return new Promise((resolve, reject) => {
      // Check if Pusher is already loaded
      if (window.Pusher) {
        console.log('Pusher already loaded');
        resolve(window.Pusher);
        return;
      }

      // Otherwise load the script
      const script = document.createElement('script');
      script.src = 'https://js.pusher.com/7.4/pusher.min.js';
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        console.log('Pusher loaded successfully');
        resolve(window.Pusher);
      };
      script.onerror = () => {
        console.error('Failed to load Pusher script');
        reject(new Error('Failed to load Pusher script'));
      };
    });
  };


  // Widget configuration
  const config = {
    key: "[WIDGET_KEY]",
    position: "[POSITION]",
    color: "[COLOR]",
    icon: "[ICON]",
    brandLogo: "[BRAND_LOGO]",
    welcomeMessage: "[WELCOME_MESSAGE]",
    apiUrl: "[API_URL]",
    companyName: "[COMPANY_NAME]" // Fallback - will be replaced dynamically
  };

  // Helper function to update company name in the UI
  const updateCompanyNameInUI = (newName) => {
    config.companyName = newName;

    // Update header if widget is already rendered
    const headerTitle = document.querySelector('.livechat-header-title');
    if (headerTitle) {
      headerTitle.textContent = newName;
    }
  };

  // Dynamically load company name based on current domain
  (function loadDomainSpecificCompanyName() {
    const cacheKey = `livechat_${config.key}_company_name`;
    const currentDomain = window.location.hostname;

    // Check localStorage cache first
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const cacheData = JSON.parse(cached);
        // Cache valid for 24 hours
        if (cacheData.domain === currentDomain && (Date.now() - cacheData.timestamp < 86400000)) {
          updateCompanyNameInUI(cacheData.companyName);
          return;
        }
      } catch (e) {
        // Invalid cache, continue to fetch
      }
    }

    // Fetch domain-specific company name from API
    fetch(`${config.apiUrl}/api/widgets/${config.key}/domain-context?domain=${encodeURIComponent(currentDomain)}`)
      .then(response => response.json())
      .then(data => {
        if (data.status === 'success' && data.company_name) {
          updateCompanyNameInUI(data.company_name);

          // Cache the result
          localStorage.setItem(cacheKey, JSON.stringify({
            domain: currentDomain,
            companyName: data.company_name,
            timestamp: Date.now()
          }));
        }
      })
      .catch(error => {
        // Silently fail - use fallback company name
        console.warn('Failed to load domain-specific company name, using fallback');
      });
  })();

  // API interaction module
  // Store visitor ID in localStorage and other data in sessionStorage for better persistence
  const visitorIdKey = `livechat_${config.key}_visitor`;
  const sessionKey = `livechat_${config.key}_session`;
  let visitorSession = {
    visitorId: null,
    conversationId: null,
    visitorEmail: null,
    visitorPhone: null,
    messages: []
  };

  // Load session data with persistent visitor ID
  const loadSession = () => {
    try {
      // First try to get persistent visitor ID from localStorage
      const persistentId = localStorage.getItem(visitorIdKey);

      // Then try to get session data from sessionStorage
      const savedSession = sessionStorage.getItem(sessionKey);

      if (savedSession) {
        visitorSession = JSON.parse(savedSession);

        // If we have a persistent ID but session doesn't, update it
        if (persistentId && !visitorSession.visitorId) {
          visitorSession.visitorId = persistentId;
        }
      } else {
        // For new sessions, prioritize the persistent ID if it exists
        if (persistentId) {
          visitorSession.visitorId = persistentId;

          // Try to fetch conversation history from server using persistent ID
          fetchConversationHistory(persistentId).then(conversationData => {
            if (conversationData && conversationData.conversationId) {
              visitorSession.conversationId = conversationData.conversationId;
              // Fetch messages for this conversation
              api.getMessages().then(result => {
                if (result.messages && result.messages.length > 0) {
                  visitorSession.messages = result.messages;
                  visitorSession.has_more = result.has_more;
                  visitorSession.oldest_message_id = result.oldest_message_id;
                  saveSession();

                  // If chat window is open, refresh messages
                  const messagesContainer = document.querySelector('.livechat-messages');
                  if (messagesContainer && chatWindow.classList.contains('active')) {
                    renderMessages(messagesContainer, result.messages);
                  }
                }
              });
            }
          });
        } else {
          // Create new visitor ID if none exists
          visitorSession.visitorId = generateVisitorId();
          // Save to localStorage for persistence
          try {
            localStorage.setItem(visitorIdKey, visitorSession.visitorId);
          } catch (e) {
            console.error('Error saving visitor ID to localStorage:', e);
          }
        }
      }
    } catch (e) {
      console.error('Error loading chat session:', e);
      visitorSession.visitorId = generateVisitorId();

      // Save to localStorage for persistence
      try {
        localStorage.setItem(visitorIdKey, visitorSession.visitorId);
      } catch (e) {
        console.error('Error saving visitor ID to localStorage:', e);
      }
    }

    saveSession();
    console.log('Visitor session:', visitorSession);
  };

  

  // Save session data - visitor ID in localStorage, session data in sessionStorage
  const saveSession = () => {
    try {
      // Always ensure the visitor ID is saved in localStorage
      localStorage.setItem(visitorIdKey, visitorSession.visitorId);

      // Save the session data to sessionStorage
      sessionStorage.setItem(sessionKey, JSON.stringify(visitorSession));
    } catch (e) {
      console.error('Error saving chat session:', e);
    }
  };

  // Generate unique visitor ID
  const generateVisitorId = () => {
    return 'v_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  // Fetch conversation history using visitor ID
  const fetchConversationHistory = async (visitorId) => {
    try {
      console.log('Fetching conversation history for visitor:', visitorId);
      const conversations = await api.getConversationHistory();

      if (conversations && conversations.length > 0) {
        console.log('Found existing conversations:', conversations.length);
        // Sort by last_message_at to get the most recent conversation
        conversations.sort((a, b) => {
          return new Date(b.last_message_at) - new Date(a.last_message_at);
        });

        // Return the most recent conversation that is still open if possible
        const openConversation = conversations.find(c => c.status === 'open');
        if (openConversation) {
          console.log('Found open conversation:', openConversation.id);
          // Persist email and phone from conversation
          if (openConversation.visitor_email) {
            visitorSession.visitorEmail = openConversation.visitor_email;
          }
          if (openConversation.visitor_phone) {
            visitorSession.visitorPhone = openConversation.visitor_phone;
          }
          saveSession();
          return {
            conversationId: openConversation.id,
            status: openConversation.status
          };
        }

        // Otherwise return the most recent conversation
        console.log('Using most recent conversation:', conversations[0].id);
        // Persist email and phone from conversation
        if (conversations[0].visitor_email) {
          visitorSession.visitorEmail = conversations[0].visitor_email;
        }
        if (conversations[0].visitor_phone) {
          visitorSession.visitorPhone = conversations[0].visitor_phone;
        }
        saveSession();
        return {
          conversationId: conversations[0].id,
          status: conversations[0].status
        };
      }

      console.log('No existing conversations found');
      return null;
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      return null;
    }
  };
  /**
   * END SESSION MANAGEMENT MODULE
   */

  // Icon SVGs
  const icons = {
    comments: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24" fill="currentColor"><path d="M256 32C114.6 32 0 125.1 0 240c0 49.6 21.4 95 57 130.7C44.5 421.1 2.7 466 2.2 466.5c-2.2 2.3-2.8 5.7-1.5 8.7S4.8 480 8 480c66.3 0 116-31.8 140.6-51.4 32.7 12.3 69 19.4 107.4 19.4 141.4 0 256-93.1 256-208S397.4 32 256 32z"/></svg>`,
    headset: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="24" height="24" fill="currentColor"><path d="M224 0c-17.7 0-32 14.3-32 32V49.9C119.5 61.4 64 124.2 64 200v33.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377.1C1.8 381.6 0 387.1 0 392.8V464c0 26.5 21.5 48 48 48H400c26.5 0 48-21.5 48-48V392.8c0-5.7-1.8-11.2-5.3-15.7l-14.9-18.8C399.5 322.9 384 278.8 384 233.4V200c0-75.8-55.5-138.6-128-150.1V32c0-17.7-14.3-32-32-32zM248 432H200c0 22.1 17.9 40 40 40h8c22.1 0 40-17.9 40-40H248z"/></svg>`,
    'comment-dots': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24" fill="currentColor"><path d="M256 32C114.6 32 0 125.1 0 240c0 49.6 21.4 95 57 130.7C44.5 421.1 2.7 466 2.2 466.5c-2.2 2.3-2.8 5.7-1.5 8.7S4.8 480 8 480c66.3 0 116-31.8 140.6-51.4 32.7 12.3 69 19.4 107.4 19.4 141.4 0 256-93.1 256-208S397.4 32 256 32zM128 272c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm128 0c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32zm128 0c-17.7 0-32-14.3-32-32s14.3-32 32-32 32 14.3 32 32-14.3 32-32 32z"/></svg>`,
    'concierge-bell': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24" fill="currentColor"><path d="M216 64c-13.3 0-24 10.7-24 24s10.7 24 24 24h80c13.3 0 24-10.7 24-24s-10.7-24-24-24H216zM64 352h384c0-97.2-78.8-176-176-176H224C126.8 176 48 254.8 48 352H0v64c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V352H64zM432 448H80V416H432v32z"/></svg>`,
    'user-circle': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" width="24" height="24" fill="currentColor"><path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 96c48.6 0 88 39.4 88 88s-39.4 88-88 88-88-39.4-88-88 39.4-88 88-88zm0 344c-58.7 0-111.3-26.6-146.5-68.2 18.8-35.4 55.6-59.8 98.5-59.8 2.4 0 4.8.4 7.1 1.1 13 4.2 26.6 6.9 40.9 6.9 14.3 0 28-2.7 40.9-6.9 2.3-.7 4.7-1.1 7.1-1.1 42.9 0 79.7 24.4 98.5 59.8C359.3 421.4 306.7 448 248 448z"/></svg>`,
    times: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512" width="24" height="24" fill="currentColor"><path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"/></svg>`,
    'paper-plane': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18" fill="currentColor"><path d="M476 3.2L12.5 270.6c-18.1 10.4-15.8 35.6 2.2 43.2L121 358.4l287.3-253.2c5.5-4.9 13.3 2.6 8.6 8.3L176 407v80.5c0 23.6 28.5 32.9 42.5 15.8L282 426l124.6 52.2c14.2 6 30.4-2.9 33-18.2l72-432C515 7.8 493.3-6.8 476 3.2z"/></svg>`,
    attachment: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18" fill="currentColor"><path d="M67.508 468.467c-58.005-58.013-58.016-151.92 0-209.943l225.011-225.04c44.643-44.645 117.279-44.645 161.92 0 44.743 44.749 44.753 117.186 0 161.944l-189.465 189.49c-31.41 31.413-82.518 31.412-113.926.001-31.479-31.482-31.49-82.453 0-113.944L311.51 110.491c4.687-4.687 12.286-4.687 16.972 0l16.967 16.971c4.685 4.686 4.685 12.283 0 16.969L184.983 304.917c-12.724 12.724-12.73 33.328 0 46.058 12.696 12.697 33.356 12.699 46.054-.001l189.465-189.489c25.987-25.989 25.994-68.06.001-94.056-25.931-25.934-68.119-25.932-94.049 0l-225.01 225.039c-39.249 39.252-39.258 102.795-.001 142.057 39.285 39.29 102.885 39.287 142.162-.028A739446.174 739446.174 0 0 1 439.497 238.49c4.686-4.687 12.282-4.684 16.969.004l16.967 16.971c4.685 4.686 4.689 12.279.004 16.965a755654.128 755654.128 0 0 0-195.881 195.996c-58.034 58.092-152.004 58.093-210.048.041z"/></svg>`,
    image: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18" fill="currentColor"><path d="M464 448H48c-26.51 0-48-21.49-48-48V112c0-26.51 21.49-48 48-48h416c26.51 0 48 21.49 48 48v288c0 26.51-21.49 48-48 48zM112 120c-30.928 0-56 25.072-56 56s25.072 56 56 56 56-25.072 56-56-25.072-56-56-56zM64 384h384V272l-87.515-87.515c-4.686-4.686-12.284-4.686-16.971 0L208 320l-55.515-55.515c-4.686-4.686-12.284-4.686-16.971 0L64 336v48z"/></svg>`,
    file: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="18" height="18" fill="currentColor"><path d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm160-14.1v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l97.9 98c4.5 4.5 7 10.6 7 16.9z"/></svg>`,
    'chevron-down': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="16" height="16" fill="currentColor"><path d="M207.029 381.476L12.686 187.132c-9.373-9.373-9.373-24.569 0-33.941l22.667-22.667c9.357-9.357 24.522-9.375 33.901-.04L224 284.505l154.745-154.021c9.379-9.335 24.544-9.317 33.901.04l22.667 22.667c9.373 9.373 9.373 24.569 0 33.941L240.971 381.476c-9.373 9.372-24.569 9.372-33.942 0z"/></svg>`
  };

  // Detect dark mode
  const isDarkMode = () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    if (bodyBg) {
      const rgb = bodyBg.match(/\d+/g);
      if (rgb && rgb.length >= 3) {
        const brightness = (parseInt(rgb[0]) * 299 + parseInt(rgb[1]) * 587 + parseInt(rgb[2]) * 114) / 1000;
        return brightness < 128;
      }
    }
    return false;
  };

  // Create stylesheet for widget
  const createStyles = () => {
    const style = document.createElement('style');
    style.id = 'livechat-styles';

    const updateStyles = () => {
      const darkMode = isDarkMode();
    style.innerHTML = `
      #livechat-widget-${config.key} * {
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }

      /* Spinner animation for buttons */
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    .livechat-spinner-small {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: #ffffff;
      animation: spin 0.8s linear infinite;
      margin: 0;
      vertical-align: middle;
    }
      
      #livechat-button-${config.key} {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background-color: ${config.color || '#3B82F6'};
        color: #fff;
        border: none;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 0 rgba(${parseInt((config.color || '#3B82F6').slice(1, 3), 16)}, ${parseInt((config.color || '#3B82F6').slice(3, 5), 16)}, ${parseInt((config.color || '#3B82F6').slice(5, 7), 16)}, 0.4);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        animation: breathe 3s ease-in-out infinite;
        overflow: visible;
        position: relative;
      }

      #livechat-button-${config.key} img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
        display: block;
      }

      #livechat-button-${config.key} svg {
        width: 28px;
        height: 28px;
      }

      @keyframes breathe {
        0%, 100% {
          transform: scale(1);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 0 rgba(${parseInt((config.color || '#3B82F6').slice(1, 3), 16)}, ${parseInt((config.color || '#3B82F6').slice(3, 5), 16)}, ${parseInt((config.color || '#3B82F6').slice(5, 7), 16)}, 0.4);
        }
        50% {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2), 0 0 0 8px rgba(${parseInt((config.color || '#3B82F6').slice(1, 3), 16)}, ${parseInt((config.color || '#3B82F6').slice(3, 5), 16)}, ${parseInt((config.color || '#3B82F6').slice(5, 7), 16)}, 0);
        }
      }

      #livechat-button-${config.key}:hover {
        transform: scale(1.08);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
        animation: none;
      }

      /* Message count badge */
      .livechat-message-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background-color: #ff4444;
        color: #fff;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }

      /* Greeting bubble */
      .livechat-greeting-bubble {
        position: fixed;
        bottom: 30px;
        ${config.position === 'left' ? 'left: 90px;' : 'right: 90px;'};
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08);
        padding: 16px 18px;
        max-width: 280px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        z-index: 2147483646;
        animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        transition: opacity 0.3s ease, transform 0.3s ease;
        border: 1px solid rgba(0, 0, 0, 0.06);
      }

      /* Speech bubble tail pointing to chat icon */
      .livechat-greeting-bubble::before {
        content: '';
        position: absolute;
        ${config.position === 'left' ? 'left: -10px;' : 'right: -10px;'};
        bottom: 20px;
        width: 0;
        height: 0;
        border-top: 10px solid transparent;
        border-bottom: 10px solid transparent;
        ${config.position === 'left' ? 'border-right: 10px solid #fff;' : 'border-left: 10px solid #fff;'};
        filter: drop-shadow(-2px 0 3px rgba(0, 0, 0, 0.1));
      }

      /* Optional: Add a subtle connecting line */
      .livechat-greeting-bubble::after {
        content: '';
        position: absolute;
        ${config.position === 'left' ? 'left: -30px;' : 'right: -30px;'};
        bottom: 28px;
        width: 20px;
        height: 2px;
        background: linear-gradient(${config.position === 'left' ? '90deg' : '-90deg'}, rgba(0, 0, 0, 0.1), transparent);
      }

      /* Waving hand icon */
      .livechat-greeting-icon {
        font-size: 26px;
        animation: wave 2s ease-in-out infinite;
        transform-origin: 70% 70%;
        display: inline-block;
        flex-shrink: 0;
        line-height: 1;
      }

      @keyframes wave {
        0%, 100% { transform: rotate(0deg); }
        10%, 30% { transform: rotate(14deg); }
        20% { transform: rotate(-8deg); }
        40%, 60% { transform: rotate(14deg); }
        50% { transform: rotate(-8deg); }
        70% { transform: rotate(0deg); }
      }

      .livechat-greeting-bubble.hidden {
        opacity: 0;
        transform: translateY(10px);
        pointer-events: none;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(12px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .livechat-greeting-content {
        flex: 1;
        font-size: 14px;
        line-height: 1.6;
        color: #374151;
        word-wrap: break-word;
        overflow-wrap: break-word;
        hyphens: auto;
        font-weight: 400;
      }

      .livechat-greeting-close {
        background: rgba(0, 0, 0, 0.04);
        border: none;
        color: #6b7280;
        font-size: 14px;
        cursor: pointer;
        padding: 0;
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        flex-shrink: 0;
        margin-top: 1px;
        opacity: 0.7;
      }

      .livechat-greeting-close:hover {
        background-color: rgba(0, 0, 0, 0.1);
        color: #1f2937;
        opacity: 1;
        transform: scale(1.08);
      }

      .livechat-greeting-close svg {
        width: 11px;
        height: 11px;
      }

      /* Mobile responsive greeting */
      @media (max-width: 768px) {
        .livechat-greeting-bubble {
          bottom: 20px;
          ${config.position === 'left' ? 'left: 85px;' : 'right: 85px;'};
          max-width: calc(100vw - 110px);
        }
      }

      #livechat-window-${config.key} {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: ${darkMode ? '#1f2937' : '#fff'};
        color: ${darkMode ? '#f3f4f6' : '#1f2937'};
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition: all 0.3s ease;
        opacity: 0;
        transform: translateY(20px);
        pointer-events: none;
        z-index: 10000;
      }
      
      /* For desktop screens */
      @media (min-width: 768px) {
        #livechat-window-${config.key}.desktop-mode {
          bottom: 90px;
          ${config.position === 'left' ? 'left: 20px; right: auto;' : 'right: 20px; left: auto;'};
          width: 380px;
          height: 520px;
          max-height: calc(100vh - 120px); /* Ensure it doesn't go off screen */
          border-radius: 16px;
          box-shadow: 0 8px 40px rgba(0, 0, 0, 0.16);
        }
      }
      
      #livechat-window-${config.key}.active {
        opacity: 1;
        transform: translateY(0);
        pointer-events: all;
      }
      
      .livechat-header {
        position: relative;
        padding: 18px 20px;
        background-color: ${config.color || '#3B82F6'};
        color: #fff;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }

      .livechat-header-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .livechat-header-logo {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        object-fit: cover;
        background-color: rgba(255, 255, 255, 0.2);
      }

      .livechat-header-logo-icon {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        background-color: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .livechat-header-logo-icon svg {
        width: 24px;
        height: 24px;
      }

      .livechat-header-info {
        flex: 1;
      }

      .livechat-header-right {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .livechat-header-title {
        font-size: 16px;
        font-weight: 600;
        letter-spacing: -0.2px;
      }

      .livechat-status {
        display: flex;
        align-items: center;
        font-size: 12px;
        margin-top: 4px;
        opacity: 0.9;
      }
      
      .livechat-status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background-color: #4CAF50;
        margin-right: 6px;
      }
      
      .livechat-dropdown-btn {
        background: none;
        border: none;
        color: #fff;
        font-size: 16px;
        cursor: pointer;
        opacity: 0.8;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        margin: 0;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        transition: background-color 0.2s, opacity 0.2s, transform 0.2s;
      }

      .livechat-dropdown-btn:hover {
        opacity: 1;
        background-color: rgba(255, 255, 255, 0.1);
      }

      .livechat-close-btn {
        background: none;
        border: none;
        color: #fff;
        font-size: 20px;
        cursor: pointer;
        opacity: 0.8;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        margin: 0;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        transition: background-color 0.2s, opacity 0.2s;
      }

      .livechat-close-btn:hover {
        opacity: 1;
        background-color: rgba(255, 255, 255, 0.1);
      }

      .livechat-dropdown-menu {
        position: absolute;
        top: 100%;
        right: 10px;
        margin-top: 5px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        padding: 12px;
        min-width: 250px;
        z-index: 10001;
        color: #1f2937;
      }

      .livechat-dropdown-item {
        padding: 8px 0;
      }

      .livechat-dropdown-item strong {
        font-size: 14px;
        color: #1f2937;
      }

      .livechat-dropdown-label {
        display: block;
        font-size: 12px;
        color: #6b7280;
        margin-bottom: 4px;
      }

      .livechat-dropdown-input {
        width: 100%;
        padding: 8px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 13px;
        transition: border-color 0.2s;
      }

      .livechat-dropdown-input:focus {
        outline: none;
        border-color: ${config.color || '#3B82F6'};
      }

      .livechat-dropdown-save-btn {
        width: 100%;
        padding: 8px;
        background-color: ${config.color || '#3B82F6'};
        color: #fff;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: opacity 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }

      .livechat-dropdown-save-btn:hover:not(:disabled) {
        opacity: 0.9;
      }

      .livechat-dropdown-save-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      .livechat-messages {
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        background-color: ${darkMode ? '#111827' : '#f7f9fc'};
        display: flex;
        flex-direction: column;
        scroll-behavior: smooth;
      }

      .livechat-load-more {
        width: 100%;
        padding: 10px;
        margin-bottom: 15px;
        background-color: ${darkMode ? '#374151' : '#fff'};
        color: ${config.color || '#3B82F6'};
        border: 1px solid ${config.color || '#3B82F6'};
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }

      .livechat-load-more:hover:not(:disabled) {
        background-color: ${config.color || '#3B82F6'};
        color: #fff;
      }

      .livechat-load-more:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .livechat-message {
        max-width: 85%;
        padding: 12px 16px;
        margin-bottom: 12px;
        border-radius: 18px;
        font-size: 15px;
        line-height: 1.5;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        transition: transform 0.2s;
      }

      .livechat-message-agent {
        background-color: ${darkMode ? '#374151' : '#f0f2f5'};
        color: ${darkMode ? '#f3f4f6' : '#333'};
        border-top-left-radius: 4px;
        align-self: flex-start;
      }

      .livechat-message-user {
        background-color: ${config.color || '#3B82F6'};
        color: #fff;
        border-top-right-radius: 4px;
        align-self: flex-end;
        margin-left: auto;
      }

      .livechat-message-system {
        background-color: ${darkMode ? '#374151' : '#f5f5f5'};
        color: ${darkMode ? '#d1d5db' : '#666'};
        font-style: italic;
        font-size: 13px;
        align-self: center;
        max-width: 80%;
        border-radius: 10px;
        padding: 8px 12px;
        margin: 8px 0;
        opacity: 1;
      }

      .livechat-sender-name {
        font-size: 11px;
        font-weight: 600;
        color: ${darkMode ? '#d1d5db' : '#666'};
        margin-bottom: 4px;
        opacity: 1;
      }

      .livechat-message-content {
        margin-bottom: 4px;
        word-wrap: break-word;
        word-break: normal;
        overflow-wrap: break-word;
        white-space: pre-wrap;
        max-width: 100%;
        overflow: hidden;
      }

      .livechat-message-content a {
        color: #3b82f6;
        text-decoration: underline;
        word-break: break-all;
      }

      .livechat-message-image {
        padding: 4px;
      }
      
      .livechat-message-image img {
        max-width: 100%;
        max-height: 200px;
        border-radius: 12px;
        cursor: pointer;
      }
      
      .livechat-message-file {
        display: flex;
        align-items: center;
        padding: 14px 16px;
        background: linear-gradient(135deg, #e0f2fe 0%, #ede9fe 100%);
        border-radius: 12px;
        border: 2px solid #3b82f6;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
      }

      .livechat-message-file:hover {
        background: linear-gradient(135deg, #bfdbfe 0%, #ddd6fe 100%);
        border-color: #2563eb;
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
      }

      .livechat-message-file a {
        display: flex;
        align-items: center;
        color: inherit;
        text-decoration: none;
        width: 100%;
      }

      .livechat-message-file-icon {
        width: 42px;
        height: 42px;
        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 14px;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
      }

      .livechat-message-file-icon svg {
        filter: brightness(0) invert(1);
      }

      .livechat-message-file-info {
        flex: 1;
        min-width: 0;
      }

      .livechat-message-file-name {
        font-weight: 700;
        margin-bottom: 4px;
        word-break: break-all;
        color: #1e293b;
        line-height: 1.4;
        font-size: 14px;
      }

      .livechat-message-file-size {
        font-size: 13px;
        font-weight: 600;
        color: #475569;
      }
      
      .livechat-message-time {
        font-size: 11px;
        opacity: 0.7;
        margin-top: 4px;
        text-align: right;
      }
      
      .livechat-input-area {
        display: flex;
        align-items: flex-end;
        padding: 15px 20px;
        border-top: 1px solid #eaedf3;
        background-color: white;
      }

      .livechat-input {
        flex: 1;
        border: 1px solid ${darkMode ? '#4b5563' : '#e0e3e9'};
        border-radius: 20px;
        padding: 12px 16px;
        font-size: 15px;
        outline: none;
        resize: none;
        overflow-y: auto;
        overflow-x: hidden;
        min-height: 45px;
        max-height: 120px;
        line-height: 1.4;
        transition: border-color 0.2s, box-shadow 0.2s;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
        -webkit-overflow-scrolling: touch;
        touch-action: pan-y;
        overscroll-behavior: contain;
        background-color: ${darkMode ? '#374151' : '#fff'};
        color: ${darkMode ? '#f3f4f6' : '#1f2937'};
      }

      .livechat-input::placeholder {
        color: ${darkMode ? '#9ca3af' : '#6b7280'};
      }

      .livechat-input:focus {
        border-color: ${config.color || '#3B82F6'};
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
      }
      
      .livechat-attach-btn {
        background: none;
        color: #666;
        border: none;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 8px;
        cursor: pointer;
        border-radius: 50%;
        transition: background-color 0.2s;
      }
      
      .livechat-attach-btn:hover {
        background-color: ${darkMode ? '#4b5563' : '#f0f2f5'};
      }

      .livechat-file-input {
        display: none;
      }

      .livechat-send-btn {
        background-color: ${config.color || '#3B82F6'};
        color: white;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        min-width: 40px;
        min-height: 40px;
        margin-left: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s, background-color 0.2s;
        touch-action: manipulation;
        -webkit-tap-highlight-color: transparent;
        pointer-events: auto;
        position: relative;
        z-index: 10;
        flex-shrink: 0;
      }

      .livechat-send-btn:hover {
        transform: scale(1.05);
        background-color: ${config.color ? config.color : '#4a90ff'};
      }

      .livechat-powered-by {
        text-align: center;
        font-size: 12px;
        color: ${darkMode ? '#9ca3af' : '#6c757d'};
        padding: 8px 0;
        background-color: ${darkMode ? '#1f2937' : '#fcfcfd'};
        border-top: 1px solid ${darkMode ? '#374151' : '#f0f0f5'};
      }
      
      .svg-icon {
        display: inline-block;
        line-height: 1;
      }
      
      /* File preview area */
      .livechat-file-preview {
        padding: 10px 20px;
        background-color: #e9ecef;
        border-top: 1px solid #dee2e6;
        border-bottom: 1px solid #dee2e6;
        display: flex;
        align-items: center;
      }

      .livechat-file-preview-content {
        flex: 1;
        display: flex;
        align-items: center;
      }

      .livechat-file-preview-image {
        max-height: 60px;
        max-width: 60px;
        border-radius: 4px;
        margin-right: 10px;
        border: 2px solid #ced4da;
        object-fit: cover;
        background-color: #fff;
      }
      
      .livechat-file-preview-info {
        flex: 1;
      }
      
      .livechat-file-preview-name {
        font-size: 14px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 200px;
      }
      
      .livechat-file-preview-size {
        font-size: 12px;
        color: #666;
      }
      
      .livechat-file-preview-remove {
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        padding: 5px;
        margin-left: 5px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .livechat-file-preview-remove:hover {
        background-color: #f0f0f0;
        color: #666;
      }
      
      /* Spinner for loading states */
      .livechat-spinner {
        display: inline-block;
        width: 40px;
        height: 40px;
        margin: 30px auto;
        border: 3px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top-color: ${config.color || '#3B82F6'};
        animation: spin 1s ease infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      
      .livechat-loading {
        text-align: center;
        padding: 30px 0;
        color: #666;
      }
      
      /* Animation for messages */
      @keyframes messageIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .livechat-message {
        animation: messageIn 0.3s ease-out;
      }
      
      /* Email notification form styling */
      .livechat-email-form {
        background-color: #f0f2f5;
        border-radius: 12px;
        padding: 15px;
        margin: 10px 0;
        width: 100%;
        align-self: center;
      }
      
      .livechat-email-form p {
        margin: 0 0 10px 0;
        font-size: 14px;
        color: #4a5568;
      }
      
      .livechat-email-input {
        width: 100%;
        padding: 10px 15px;
        border: 1px solid ${darkMode ? '#4b5563' : '#e2e8f0'};
        border-radius: 8px;
        font-size: 14px;
        margin-bottom: 10px;
        outline: none;
        transition: border-color 0.2s;
        background-color: ${darkMode ? '#374151' : '#fff'};
        color: ${darkMode ? '#f3f4f6' : '#1f2937'};
      }

      .livechat-email-input::placeholder {
        color: ${darkMode ? '#9ca3af' : '#9ca3af'};
      }

      .livechat-email-input:focus {
        border-color: ${config.color || '#3B82F6'};
      }

      .livechat-phone-input {
        width: 100%;
        padding: 10px 15px;
        border: 1px solid ${darkMode ? '#4b5563' : '#e2e8f0'};
        border-radius: 8px;
        font-size: 14px;
        margin-bottom: 10px;
        outline: none;
        transition: border-color 0.2s;
        background-color: ${darkMode ? '#374151' : '#fff'};
        color: ${darkMode ? '#f3f4f6' : '#1f2937'};
      }

      .livechat-phone-input::placeholder {
        color: ${darkMode ? '#9ca3af' : '#9ca3af'};
      }

      .livechat-phone-input:focus {
        border-color: ${config.color || '#3B82F6'};
      }

      .livechat-email-submit {
        padding: 8px 16px;
        background-color: ${config.color || '#3B82F6'};
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      
      .livechat-email-submit:hover {
        background-color: ${config.color ? config.color : '#4a90ff'};
      }
      
      /* FIX: Positioning fixes to ensure chat widget stays on top of all elements */
      #livechat-widget-${config.key} {
        position: fixed !important;
        bottom: 20px !important;
        ${config.position === 'left' ? 'left: 20px !important; right: auto !important;' : 'right: 20px !important; left: auto !important;'};
        z-index: 2147483647 !important; /* Maximum possible z-index */
        pointer-events: none !important;
      }
      
      #livechat-button-${config.key} {
        position: relative !important;
        z-index: 2147483647 !important;
        pointer-events: auto !important;
      }
      
      #livechat-window-${config.key} {
        z-index: 2147483646 !important; /* Just below max z-index */
        pointer-events: none !important; /* Ensure it doesn't block interactions when closed */
      }
      
      #livechat-window-${config.key}.active {
        pointer-events: auto !important;
      }
      
      @media (min-width: 768px) {
        #livechat-window-${config.key}.desktop-mode {
          position: fixed !important;
          ${config.position === 'left' ? 'left: 20px !important; right: auto !important;' : 'right: 20px !important; left: auto !important;'};
          bottom: 90px !important;
        }
      }
      
      /* WebSocket typing indicator */
.livechat-typing {
  display: none;
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-radius: 12px;
  margin: 5px 0;
  font-size: 13px;
  color: #666;
  align-self: flex-start;
  max-width: 90%;
}
        
      
      .livechat-typing-dots {
        display: inline-block;
      }
      
.livechat-typing-animation {
  display: inline-flex;
  align-items: center;
  margin-left: 5px;
}

.livechat-typing-dot {
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #999;
  margin: 0 1px;
  animation: typingAnimation 1.4s infinite;
  animation-fill-mode: both;
}

      
.livechat-typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}
      
.livechat-typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}

      
@keyframes typingAnimation {
  0% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
  100% { transform: translateY(0); }
}
    `;
    };

    updateStyles();
    document.head.appendChild(style);

    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateStyles);
    }

    const observer = new MutationObserver(() => {
      updateStyles();
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'style']
    });
  };

  // Get icon SVG based on name
  const getIconSvg = (iconName) => {
    // Default to comments if icon not found
    return icons[iconName] || icons['comments'];
  };

  // Format file size to human readable
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format timestamp to readable time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Show file preview before sending
  const createFilePreview = (file, removeCallback) => {
    const previewContainer = document.createElement('div');
    previewContainer.className = 'livechat-file-preview';

    const previewContent = document.createElement('div');
    previewContent.className = 'livechat-file-preview-content';

    // If it's an image, show a thumbnail
    if (file.type.startsWith('image/')) {
      const img = document.createElement('img');
      img.className = 'livechat-file-preview-image';

      // Create URL for the image
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);

      previewContent.appendChild(img);
    } else {
      // For other files, show an icon
      const fileIcon = document.createElement('div');
      fileIcon.className = 'livechat-message-file-icon';
      fileIcon.innerHTML = icons.file;
      previewContent.appendChild(fileIcon);
    }

    // Add file info
    const fileInfo = document.createElement('div');
    fileInfo.className = 'livechat-file-preview-info';

    const fileName = document.createElement('div');
    fileName.className = 'livechat-file-preview-name';
    fileName.textContent = file.name;

    const fileSize = document.createElement('div');
    fileSize.className = 'livechat-file-preview-size';
    fileSize.textContent = formatFileSize(file.size);

    fileInfo.appendChild(fileName);
    fileInfo.appendChild(fileSize);
    previewContent.appendChild(fileInfo);

    // Add remove button
    const removeButton = document.createElement('button');
    removeButton.className = 'livechat-file-preview-remove';
    removeButton.innerHTML = icons.times;
    removeButton.addEventListener('click', removeCallback);

    previewContainer.appendChild(previewContent);
    previewContainer.appendChild(removeButton);

    return previewContainer;
  };

  // Message polling manager
  const messagePollManager = (() => {
    let pollTimeout = null;
    let pollCount = 0;
    let lastMessageId = 0;
    let isPolling = false;
    const MAX_FOLLOW_UP_POLLS = 4; // Number of polls to do after typing stops
    const POLL_INTERVAL = 3000; // 3 seconds between polls

    // Start polling cycle
    const startPolling = () => {
      if (isPolling) return; // Already polling

      console.log('Starting message polling...');
      isPolling = true;
      pollCount = 0;

      // Poll immediately
      pollMessages();
    };

    // Stop polling cycle
    const stopPolling = () => {
      if (pollTimeout) {
        clearTimeout(pollTimeout);
        pollTimeout = null;
      }

      if (isPolling) {
        console.log('Message polling stopped');
        isPolling = false;
      }
    };

    // Poll for new messages with the since_id parameter
    const pollMessages = async () => {
      if (!visitorSession.conversationId || !chatWindow.classList.contains('active')) {
        stopPolling();
        return;
      }

      try {
        // Find the ID of the most recent message
        if (visitorSession.messages && visitorSession.messages.length > 0) {
          // Get the highest message ID from the array
          const messageIds = visitorSession.messages.map(m => parseInt(m.id));
          lastMessageId = Math.max(...messageIds);
        }

        console.log(`Polling for messages since ID ${lastMessageId}...`);

        // Add since_id parameter if we have a last message ID
        const sinceParam = lastMessageId ? `&since_id=${lastMessageId}` : '';

        // Make the API request
        const response = await fetch(
          `${config.apiUrl}/api/widgets/messages/visitor?widget_key=${config.key}&conversation_id=${visitorSession.conversationId}${sinceParam}`
        );

        if (!response.ok) {
          throw new Error(`Error polling: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === 'success') {
          // Check if we have new messages
          if (data.messages && data.messages.length > 0) {
            console.log(`Found ${data.messages.length} new message(s)`);

            // Merge messages without duplicates
            const existingIds = visitorSession.messages.map(m => m.id);
            const newMessages = data.messages.filter(m => !existingIds.includes(m.id));

            if (newMessages.length > 0) {
              visitorSession.messages = [...visitorSession.messages, ...newMessages];
              saveSession();

              // Update the UI
              const messagesContainer = chatWindow.querySelector('.livechat-messages');
              if (messagesContainer) {
                renderMessages(messagesContainer, visitorSession.messages);
              }

              // If we got new messages, ensure we keep polling
              pollCount = 0;
            }
          }
        }
      } catch (error) {
        console.error('Error polling for messages:', error);
      }

      // Schedule next poll if needed
      pollCount++;

      // If agent is still typing or we haven't reached max follow-up polls
      if (isAgentTyping || pollCount <= MAX_FOLLOW_UP_POLLS) {
        pollTimeout = setTimeout(pollMessages, POLL_INTERVAL);
      } else {
        console.log(`Polling stopped after ${pollCount} polls`);
        isPolling = false;
      }
    };

    // For tracking typing state
    let isAgentTyping = false;

    // Update typing state and manage polling
    const setAgentTyping = (typing) => {
      const wasTyping = isAgentTyping;
      isAgentTyping = typing;

      // Start polling when agent starts typing
      if (!wasTyping && typing) {
        startPolling();
      }
    };

    return {
      startPolling,
      stopPolling,
      setAgentTyping,
      isPolling: () => isPolling
    };
  })();

  // API functions
  const api = {
    // Start a new conversation
    startConversation: async (firstMessage, file = null) => {
      try {
        // Use FormData to support file uploads
        const formData = new FormData();
        formData.append('widget_key', config.key);
        formData.append('first_message', firstMessage);
        formData.append('visitor_id', visitorSession.visitorId);

        if (visitorSession.visitorName) {
          formData.append('visitor_name', visitorSession.visitorName);
        }

        if (visitorSession.visitorEmail) {
          formData.append('visitor_email', visitorSession.visitorEmail);
        }

        // Add more detailed client information for better tracking
        formData.append('visitor_user_agent', navigator.userAgent);
        formData.append('visitor_language', navigator.language);
        formData.append('visitor_platform', navigator.platform);
        formData.append('visitor_screen_resolution', `${window.screen.width}x${window.screen.height}`);
        formData.append('visitor_timezone', Intl.DateTimeFormat().resolvedOptions().timeZone);
        formData.append('visitor_referrer', document.referrer);
        formData.append('visitor_url', window.location.href);
        formData.append('page_url', window.location.href); // Track page for visitor_pages

        // Add additional browser capabilities data
        const browserCapabilities = {
          cookiesEnabled: navigator.cookieEnabled,
          doNotTrack: navigator.doNotTrack,
          javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
          localStorage: !!window.localStorage,
          sessionStorage: !!window.sessionStorage,
          touchScreen: ('ontouchstart' in window) || navigator.maxTouchPoints > 0,
          vendor: navigator.vendor,
          windowSize: `${window.innerWidth}x${window.innerHeight}`
        };

        formData.append('browser_capabilities', JSON.stringify(browserCapabilities));

        if (file) {
          formData.append('file', file);
        }

        const response = await fetch(`${config.apiUrl}/api/widgets/conversations/start`, {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (data.status === 'success') {
          visitorSession.conversationId = data.conversation_id;
          saveSession();

          // Add messages to the conversation
          if (data.first_message) {
            visitorSession.messages.push(data.first_message);
          }

          if (data.auto_reply) {
            visitorSession.messages.push(data.auto_reply);
          }

          saveSession();
          return data;
        } else {
          console.error('Failed to start conversation:', data.message);
          return null;
        }
      } catch (error) {
        console.error('Error starting conversation:', error);
        return null;
      }
    },


    getConversationStatus: async () => {
      if (!visitorSession.conversationId) return null;

      try {
        const response = await fetch(`${config.apiUrl}/api/widgets/conversations/status?widget_key=${config.key}&conversation_id=${visitorSession.conversationId}`);
        const data = await response.json();

        if (data.status === 'success') {
          return data.conversation;
        } else {
          console.error('Failed to get conversation status:', data.message);
          return null;
        }
      } catch (error) {
        console.error('Error getting conversation status:', error);
        return null;
      }
    },

    // Send a message
    sendMessage: async (content, file = null) => {
      if (!visitorSession.conversationId) {
        // If no conversation exists, start one
        const conversationData = await api.startConversation(content, file);
        if (!conversationData) return null;

        // Messages are already added in startConversation
        return conversationData;
      }

      try {
        // For debugging - log what we're trying to send
        console.log('Sending message:', {
          hasContent: !!content,
          hasFile: !!file,
          content: content,
          fileInfo: file ? { name: file.name, type: file.type, size: file.size } : null
        });

        // APPROACH: Always send file and content in separate requests
        // to avoid any server-side issues with multipart/form-data processing

        let textResult = null;
        let fileResult = null;

        // First send the text message if there is content
        if (content && content.trim() !== '') {
          const textFormData = new FormData();
          textFormData.append('widget_key', config.key);
          textFormData.append('conversation_id', visitorSession.conversationId);
          textFormData.append('content', content);
          textFormData.append('page_url', window.location.href); // Track current page

          console.log('Sending text message...');
          const textResponse = await fetch(`${config.apiUrl}/api/widgets/messages/send`, {
            method: 'POST',
            body: textFormData
          });

          // Check if response is JSON
          const textContentType = textResponse.headers.get('content-type');
          if (!textContentType || !textContentType.includes('application/json')) {
            console.error('Non-JSON response for text message:', await textResponse.text());
          } else {
            const textData = await textResponse.json();
            console.log('Text message response:', textData);

            if (textData.status === 'success') {
              // Add message to the conversation
              visitorSession.messages.push(textData.data);

              // Add AI response if present
              if (textData.ai_response) {
                visitorSession.messages.push(textData.ai_response);
              }

              saveSession();
              textResult = textData.data;
            } else {
              console.error('Failed to send text message:', textData.message);
            }
          }
        }

        // Then send the file if there is one
        if (file) {
          // Check file size
          if (file.size > 10 * 1024 * 1024) { // 10MB
            console.error('File too large:', file.size);
            return {
              error: true,
              message: 'File size exceeds 10MB limit'
            };
          }

          const fileFormData = new FormData();
          fileFormData.append('widget_key', config.key);
          fileFormData.append('conversation_id', visitorSession.conversationId);
          fileFormData.append('file', file);
          // Empty content for file message (or the original content if no separate text message was sent)
          fileFormData.append('content', (!content || content.trim() === '') ? '' : '');
          fileFormData.append('page_url', window.location.href); // Track current page

          // Set longer timeout for file uploads
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

          console.log('Sending file message...');
          const fileResponse = await fetch(`${config.apiUrl}/api/widgets/messages/send`, {
            method: 'POST',
            body: fileFormData,
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          // Check if response is JSON
          const fileContentType = fileResponse.headers.get('content-type');
          if (!fileContentType || !fileContentType.includes('application/json')) {
            console.error('Non-JSON response for file message:', await fileResponse.text());
          } else {
            const fileData = await fileResponse.json();
            console.log('File message response:', fileData);

            if (fileData.status === 'success') {
              // Add message to the conversation
              visitorSession.messages.push(fileData.data);
              saveSession();
              fileResult = fileData.data;
            } else {
              console.error('Failed to send file message:', fileData.message);
            }
          }
        }

        // Return the appropriate result
        if (fileResult) {
          return fileResult; // Prioritize file result if both were sent
        } else if (textResult) {
          return textResult;
        } else {
          return null; // Both failed or nothing was sent
        }

      } catch (error) {
        console.error('Error sending message:', error);
        return null;
      }
    },

    // Update visitor email and phone
    updateVisitorEmail: async (email, phone) => {
      try {
        // Store email and phone in session
        visitorSession.visitorEmail = email;
        visitorSession.visitorPhone = phone;
        saveSession();

        // If we have an active conversation, update it
        if (visitorSession.conversationId) {
          const formData = new FormData();
          formData.append('widget_key', config.key);
          formData.append('conversation_id', visitorSession.conversationId);
          formData.append('visitor_email', email);
          if (phone) formData.append('visitor_phone', phone);

          const response = await fetch(`${config.apiUrl}/api/widgets/conversations/update`, {
            method: 'POST',
            body: formData
          });

          const data = await response.json();

          if (data.status === 'success') {
            return true;
          } else {
            console.error('Failed to update visitor email:', data.message);
            return false;
          }
        }

        return true;
      } catch (error) {
        console.error('Error updating visitor email:', error);
        return false;
      }
    },

    // Get conversation history
    getMessages: async (beforeId = null, limit = 8) => {
      if (!visitorSession.conversationId) return { messages: [], has_more: false };

      try {
        let url = `${config.apiUrl}/api/widgets/messages/visitor?widget_key=${config.key}&conversation_id=${visitorSession.conversationId}&limit=${limit}`;
        if (beforeId) {
          url += `&before_id=${beforeId}`;
        }

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'success') {
          if (beforeId) {
            // Prepend older messages
            visitorSession.messages = [...data.messages, ...visitorSession.messages];
          } else {
            // Initial load
            visitorSession.messages = data.messages;
          }
          visitorSession.has_more = data.has_more || false;
          visitorSession.oldest_message_id = data.oldest_message_id;
          saveSession();
          return {
            messages: data.messages,
            has_more: data.has_more || false,
            oldest_message_id: data.oldest_message_id
          };
        } else {
          console.error('Failed to get messages:', data.message);
          return { messages: [], has_more: false };
        }
      } catch (error) {
        console.error('Error getting messages:', error);
        return { messages: [], has_more: false };
      }
    },

    // Get visitor conversation history
    getConversationHistory: async () => {
      try {
        const response = await fetch(`${config.apiUrl}/api/widgets/conversations/visitor?widget_key=${config.key}&visitor_id=${visitorSession.visitorId}`);
        const data = await response.json();

        if (data.status === 'success') {
          return data.conversations;
        } else {
          console.error('Failed to get conversation history:', data.message);
          return [];
        }
      } catch (error) {
        console.error('Error getting conversation history:', error);
        return [];
      }
    }
  };

  // Create chat window
  const createChatWindow = () => {
    const window = document.createElement('div');
    window.id = `livechat-window-${config.key}`;

    // Chat header
    const header = document.createElement('div');
    header.className = 'livechat-header';

    header.innerHTML = `
      <div class="livechat-header-left">
        <div class="livechat-header-logo-container"></div>
        <div class="livechat-header-info">
          <div class="livechat-header-title">${config.companyName || 'LiveChat'}</div>
          <div class="livechat-status">
            <div class="livechat-status-dot"></div>
            <span>Online now</span>
          </div>
        </div>
      </div>
      <div class="livechat-header-right">
        <button class="livechat-dropdown-btn">${icons['chevron-down']}</button>
        <button class="livechat-close-btn">${icons.times}</button>
      </div>
    `;

    // Add logo with error handling
    const logoContainer = header.querySelector('.livechat-header-logo-container');
    if (config.brandLogo) {
      const logoImg = document.createElement('img');
      logoImg.src = config.brandLogo;
      logoImg.alt = 'Logo';
      logoImg.className = 'livechat-header-logo';

      // Fallback to icon if image fails to load
      logoImg.onerror = function(e) {
        console.warn('Header brand logo failed to load:', config.brandLogo, e);
        logoContainer.innerHTML = `<div class="livechat-header-logo-icon">${getIconSvg(config.icon)}</div>`;
      };

      logoImg.onload = function() {
        console.log('Header brand logo loaded successfully');
      };

      logoContainer.appendChild(logoImg);
    } else {
      logoContainer.innerHTML = `<div class="livechat-header-logo-icon">${getIconSvg(config.icon)}</div>`;
    }

    // Create dropdown menu
    const dropdownMenu = document.createElement('div');
    dropdownMenu.className = 'livechat-dropdown-menu';
    dropdownMenu.style.display = 'none';

    // Chat messages area
    const messagesContainer = document.createElement('div');
    messagesContainer.className = 'livechat-messages';
    messagesContainer.innerHTML = '<div class="livechat-loading"><div class="livechat-spinner"></div><p>Loading messages...</p></div>';

    // Agent typing indicator (for WebSocket)
    // const typingIndicator = document.createElement('div');
    // typingIndicator.className = 'livechat-typing';
    // typingIndicator.innerHTML = `
    //   Agent is typing
    //   <span class="livechat-typing-dots">
    //     <span class="livechat-typing-dot"></span>
    //     <span class="livechat-typing-dot"></span>
    //     <span class="livechat-typing-dot"></span>
    //   </span>
    // `;
    // typingIndicator.style.display = 'none'; // Hidden by default
    // messagesContainer.appendChild(typingIndicator);

    // Email collection form (visible by default)
    const emailForm = document.createElement('div');
    emailForm.className = 'livechat-message livechat-email-form';
    emailForm.innerHTML = `
      <p>Share your contact to receive notifications about replies:</p>
      <input type="email" class="livechat-email-input" placeholder="your@email.com" style="margin-bottom: 8px;">
      <input type="tel" class="livechat-phone-input" placeholder="+1 234 567 8900" style="margin-bottom: 8px;">
      <button class="livechat-email-submit">Submit</button>
    `;


    // Agent typing indicator (placed above input area)
    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'livechat-typing';
    typingIndicator.innerHTML = `
  Agent is typing
  <span class="livechat-typing-animation">
    <span class="livechat-typing-dot"></span>
    <span class="livechat-typing-dot"></span>
    <span class="livechat-typing-dot"></span>
  </span>
`;
    typingIndicator.style.display = 'none'; // Hidden by default

    // Chat input area with file upload
    const inputArea = document.createElement('div');
    inputArea.className = 'livechat-input-area';
    inputArea.innerHTML = `
      <label class="livechat-attach-btn">
        ${icons.attachment}
        <input type="file" class="livechat-file-input" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt" capture="environment">
      </label>
      <textarea class="livechat-input" placeholder="Type your message..." rows="1"></textarea>
      <button class="livechat-send-btn">${icons['paper-plane']}</button>
    `;

    // File preview area (hidden by default)
    const filePreviewArea = document.createElement('div');
    filePreviewArea.className = 'livechat-file-preview';
    filePreviewArea.style.display = 'none';

    // Powered by footer
    const footer = document.createElement('div');
    footer.className = 'livechat-powered-by';
    footer.innerHTML = 'Powered by <a href="http://codedweb-ventures-company.vercel.app/" target="_blank" style="color:#3B82F6;text-decoration:none;font-weight:500;">CodedWeb</a>';

    // Assemble chat window
    // window.appendChild(header);
    // window.appendChild(messagesContainer);
    // window.appendChild(filePreviewArea); // Add file preview area
    // window.appendChild(inputArea);
    // window.appendChild(footer);

    // Function to render dropdown content
    const renderDropdown = () => {
      const email = visitorSession.visitorEmail || '';
      const phone = visitorSession.visitorPhone || '';

      dropdownMenu.innerHTML = `
        <div class="livechat-dropdown-item">
          <strong>Your Contact Info</strong>
        </div>
        <div class="livechat-dropdown-item">
          <span class="livechat-dropdown-label">Email:</span>
          <input type="email" class="livechat-dropdown-input" id="livechat-dropdown-email" value="${email || ''}" placeholder="your@email.com">
        </div>
        <div class="livechat-dropdown-item">
          <span class="livechat-dropdown-label">Phone:</span>
          <input type="tel" class="livechat-dropdown-input" id="livechat-dropdown-phone" value="${phone || ''}" placeholder="+1 234 567 8900">
        </div>
        <div class="livechat-dropdown-item">
          <button class="livechat-dropdown-save-btn">Save Changes</button>
        </div>
      `;

      // Add save event listener
      const saveBtn = dropdownMenu.querySelector('.livechat-dropdown-save-btn');
      saveBtn.addEventListener('click', async () => {
        const emailInput = document.getElementById('livechat-dropdown-email');
        const phoneInput = document.getElementById('livechat-dropdown-phone');
        const newEmail = emailInput.value.trim();
        const newPhone = phoneInput.value.trim();

        if (newEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
          emailInput.style.borderColor = '#f56565';
          return;
        }

        saveBtn.innerHTML = '<div class="livechat-spinner-small"></div>';
        saveBtn.disabled = true;

        try {
          const success = await api.updateVisitorEmail(newEmail, newPhone);
          if (success) {
            visitorSession.visitorEmail = newEmail;
            visitorSession.visitorPhone = newPhone;
            saveSession();
            saveBtn.innerHTML = 'Saved!';
            setTimeout(() => {
              dropdownMenu.style.display = 'none';
              renderDropdown();
            }, 1000);
          }
        } catch (error) {
          console.error('Error updating contact:', error);
          saveBtn.innerHTML = 'Error - Try Again';
          saveBtn.disabled = false;
        }
      });
    };

    // Append dropdown to header
    header.appendChild(dropdownMenu);
    renderDropdown();

    // Dropdown toggle event
    const dropdownBtn = header.querySelector('.livechat-dropdown-btn');
    dropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Refresh dropdown data from session before showing
      if (dropdownMenu.style.display === 'none') {
        renderDropdown();
      }
      dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target)) {
        dropdownMenu.style.display = 'none';
      }
    });

    window.appendChild(header);
    window.appendChild(messagesContainer);
    window.appendChild(typingIndicator); // Add typing indicator above input area
    window.appendChild(filePreviewArea); // Add file preview area
    window.appendChild(inputArea);
    window.appendChild(footer);

    return window;
  };

  // Function to convert URLs in text to clickable links
  const linkifyText = (text) => {
    const urlPattern = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    const wwwPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

    // Escape HTML to prevent XSS
    const escapeHtml = (unsafe) => {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    };

    let linkedText = escapeHtml(text);

    // Convert URLs starting with http://, https://, or ftp://
    linkedText = linkedText.replace(urlPattern, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');

    // Convert www. URLs
    linkedText = linkedText.replace(wwwPattern, '$1<a href="http://$2" target="_blank" rel="noopener noreferrer">$2</a>');

    return linkedText;
  };

  // Render messages in the chat window
  const renderMessages = (messagesContainer, messages) => {
    // Clear loading message but keep typing indicator
    const typingIndicator = messagesContainer.querySelector('.livechat-typing');
    messagesContainer.innerHTML = '';
    if (typingIndicator) {
      messagesContainer.appendChild(typingIndicator);
    }

    // Add "Load More" button if there are more messages
    if (visitorSession.has_more && messages.length > 0) {
      const loadMoreBtn = document.createElement('button');
      loadMoreBtn.className = 'livechat-load-more';
      loadMoreBtn.textContent = 'Load older messages';
      loadMoreBtn.onclick = async () => {
        loadMoreBtn.disabled = true;
        loadMoreBtn.innerHTML = '<div class="livechat-spinner-small"></div> Loading...';
        try {
          const result = await api.getMessages(visitorSession.oldest_message_id, 8);
          visitorSession.has_more = result.has_more;
          visitorSession.oldest_message_id = result.oldest_message_id;
          renderMessages(messagesContainer, visitorSession.messages);
        } catch (error) {
          console.error('Error loading more messages:', error);
          loadMoreBtn.disabled = false;
          loadMoreBtn.textContent = 'Load older messages';
        }
      };
      messagesContainer.appendChild(loadMoreBtn);
    }

    // Add email form after a short delay
    setTimeout(() => {
      if (!visitorSession.visitorEmail && !messagesContainer.querySelector('.livechat-email-form')) {
        // Create email form element
        const emailForm = document.createElement('div');
        emailForm.className = 'livechat-message livechat-email-form';

        // Initial state
        emailForm.innerHTML = `
      <p>Share your contact to receive notifications about replies:</p>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <input type="email" class="livechat-email-input" placeholder="your@email.com">
        <input type="tel" class="livechat-phone-input" placeholder="+1 234 567 8900">
        <button class="livechat-email-submit">Submit</button>
      </div>
    `;

        // Get elements
        const emailInput = emailForm.querySelector('.livechat-email-input');
        const phoneInput = emailForm.querySelector('.livechat-phone-input');
        const submitButton = emailForm.querySelector('.livechat-email-submit');

        // Add event listener for submit
        submitButton.addEventListener('click', async () => {
          const email = emailInput.value.trim();
          const phone = phoneInput.value.trim();

          if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            emailInput.style.borderColor = '#f56565';
            return;
          }

          // Show loading state
          const originalButtonText = submitButton.innerHTML;
          submitButton.innerHTML = '<div class="livechat-spinner-small"></div>';
          submitButton.disabled = true;

          try {
            // Update visitor email and phone
            const success = await api.updateVisitorEmail(email, phone);

            if (success) {
              // Show success message
              emailForm.innerHTML = `<p>Thank you! We'll notify you at ${email}</p>`;
            } else {
              // Reset button and show error
              submitButton.innerHTML = originalButtonText;
              submitButton.disabled = false;

              // Show error state
              emailInput.style.borderColor = '#f56565';

              // Add error message if not already present
              if (!emailForm.querySelector('.livechat-email-error')) {
                const errorMsg = document.createElement('div');
                errorMsg.className = 'livechat-email-error';
                errorMsg.textContent = 'Failed to update email. Please try again.';
                errorMsg.style.color = '#f56565';
                errorMsg.style.fontSize = '12px';
                errorMsg.style.marginTop = '5px';
                emailForm.appendChild(errorMsg);
              }
            }
          } catch (error) {
            console.error('Error updating email:', error);

            // Reset button state
            submitButton.innerHTML = originalButtonText;
            submitButton.disabled = false;

            // Show error message
            const errorMsg = document.createElement('div');
            errorMsg.className = 'livechat-email-error';
            errorMsg.textContent = 'An error occurred. Please try again.';
            errorMsg.style.color = '#f56565';
            errorMsg.style.fontSize = '12px';
            errorMsg.style.marginTop = '5px';

            // Remove existing error message if any
            const existingError = emailForm.querySelector('.livechat-email-error');
            if (existingError) {
              existingError.remove();
            }

            emailForm.appendChild(errorMsg);
          }
        });

        messagesContainer.appendChild(emailForm);
      }
    }, 1000);

    if (messages.length === 0) {
      // Add welcome message if no messages
      const welcomeMessage = document.createElement('div');
      welcomeMessage.className = 'livechat-message livechat-message-agent';
      welcomeMessage.textContent = config.welcomeMessage;
      messagesContainer.appendChild(welcomeMessage);
      return;
    }

    // Add messages
    messages.forEach(message => {
      const messageEl = document.createElement('div');

      // Determine message class based on sender type
      let className = 'livechat-message ';
      if (message.sender_type === 'visitor') {
        className += 'livechat-message-user';
      } else if (message.sender_type === 'system') {
        className += 'livechat-message-system';
      } else {
        className += 'livechat-message-agent';
      }

      // Add additional class based on message type
      if (message.type === 'image') {
        className += ' livechat-message-image';
      } else if (message.type === 'file') {
        className += ' livechat-message-file';
      }

      messageEl.className = className;

      // Add sender name for agent/bot messages
      if (message.sender_name && message.sender_type !== 'visitor') {
        const senderNameEl = document.createElement('div');
        senderNameEl.className = 'livechat-sender-name';
        senderNameEl.textContent = message.sender_name;
        messageEl.appendChild(senderNameEl);
      }

      // Create content wrapper
      const contentWrapper = document.createElement('div');
      contentWrapper.className = 'livechat-message-content';

      // Set content based on message type
      if (message.type === 'text') {
        contentWrapper.innerHTML = linkifyText(message.content);
      } else if (message.type === 'image') {
        contentWrapper.innerHTML = `<img src="${message.file_url}" alt="Image">`;
      } else if (message.type === 'file') {
        contentWrapper.innerHTML = `
          <a href="${message.file_url}" target="_blank">
            <div class="livechat-message-file-icon">${icons.file}</div>
            <div class="livechat-message-file-info">
              <div class="livechat-message-file-name">${message.file_name || 'File'}</div>
              <div class="livechat-message-file-size">${formatFileSize(message.file_size || 0)}</div>
            </div>
          </a>
        `;
      } else {
        contentWrapper.innerHTML = linkifyText(message.content);
      }

      messageEl.appendChild(contentWrapper);

      // Add timestamp
      const timeEl = document.createElement('div');
      timeEl.className = 'livechat-message-time';
      timeEl.textContent = formatTime(message.created_at);
      messageEl.appendChild(timeEl);

      messagesContainer.appendChild(messageEl);
    });

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  // Create styles
  createStyles();

  // Create widget container
  const container = document.createElement('div');
  container.id = `livechat-widget-${config.key}`;

  // Apply proper positioning and z-index
  container.style.position = 'fixed';
  container.style.bottom = '20px';
  container.style.zIndex = '2147483647';
  container.style.pointerEvents = 'none';

  // Set position (left or right)
  if (config.position === 'left') {
    container.style.setProperty('left', '20px', 'important');
    container.style.setProperty('right', 'auto', 'important');
  } else {
    container.style.setProperty('right', '20px', 'important');
    container.style.setProperty('left', 'auto', 'important');
  }

  // Create chat button with brand logo or SVG icon
  const button = document.createElement('button');
  button.id = `livechat-button-${config.key}`;

  // Use brand logo if available, otherwise use icon
  if (config.brandLogo) {
    const img = document.createElement('img');
    img.src = config.brandLogo;
    img.alt = 'Chat';

    // Fallback to icon if image fails to load
    img.onerror = function(e) {
      console.warn('Brand logo failed to load:', config.brandLogo, e);
      button.innerHTML = getIconSvg(config.icon);
    };

    img.onload = function() {
      console.log('Brand logo loaded successfully:', config.brandLogo);
    };

    button.appendChild(img);
  } else {
    button.innerHTML = getIconSvg(config.icon);
  }

  // Ensure button is clickable
  button.style.pointerEvents = 'auto';
  button.style.position = 'relative';
  button.style.zIndex = '2147483647';

  // Create the chat window
  const chatWindow = createChatWindow();

  // Truncate welcome message to 65 words
  const truncateMessage = (message, wordLimit = 65) => {
    const words = message.trim().split(/\s+/);
    if (words.length <= wordLimit) {
      return message;
    }
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  // Create greeting bubble
  const greetingBubble = document.createElement('div');
  greetingBubble.className = 'livechat-greeting-bubble';
  greetingBubble.innerHTML = `
    <span class="livechat-greeting-icon">👋</span>
    <div class="livechat-greeting-content">${truncateMessage(config.welcomeMessage)}</div>
    <button class="livechat-greeting-close">${icons.times}</button>
  `;
  greetingBubble.style.pointerEvents = 'auto';

  // Add elements to DOM
  container.appendChild(button);
  container.appendChild(greetingBubble);
  container.appendChild(chatWindow);

  // Add directly to body to ensure it's not nested in other elements
  document.body.appendChild(container);

  // Notification system for unread messages
  const notificationManager = (() => {
    let unreadCount = 0;
    let messageBadge = null;
    let audioElement = null;
    let audioUnlocked = false;

    // Simple base64 notification sound
    const notificationSoundBase64 = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSiK1vLTgjMGHm7A7+OZSA0PVqzn77BdGgxEnuPwtmMcBSN/0fLeizsKF2W57OihUBELTKXh8bllHAU2jtjy0n0qBSh+zPDejj0LFmS87OmoWBcLSqDj8Ldl';

    // Initialize audio
    try {
      audioElement = new Audio(notificationSoundBase64);
      audioElement.volume = 0.4;
      audioElement.load();
    } catch (e) {
      console.log('Audio not supported');
    }

    // Unlock audio on first user interaction (removed after first unlock)
    const unlockAudio = () => {
      if (!audioElement || audioUnlocked) return;

      audioElement.play().then(() => {
        audioElement.pause();
        audioElement.currentTime = 0;
        audioUnlocked = true;
        console.log('Audio unlocked');

        // Remove all unlock listeners
        document.removeEventListener('click', unlockAudio, true);
        document.removeEventListener('keydown', unlockAudio, true);
      }).catch(() => {});
    };

    // Setup unlock listeners
    if (audioElement) {
      document.addEventListener('click', unlockAudio, { capture: true, once: false });
      document.addEventListener('keydown', unlockAudio, { capture: true, once: false });
    }

    // Create or update badge
    const updateBadge = () => {
      if (!messageBadge) {
        messageBadge = document.createElement('div');
        messageBadge.className = 'livechat-message-badge';
        button.appendChild(messageBadge);
      }

      if (unreadCount > 0) {
        messageBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        messageBadge.style.display = 'flex';
      } else {
        messageBadge.style.display = 'none';
      }
    };

    // Increment unread count
    const incrementUnread = () => {
      // Only increment if chat is closed
      if (!chatWindow.classList.contains('active')) {
        unreadCount++;
        updateBadge();

        // Play sound only for incoming messages
        if (audioElement) {
          audioElement.currentTime = 0;
          audioElement.play().catch(() => {});
        }
      }
    };

    // Reset unread count
    const resetUnread = () => {
      unreadCount = 0;
      updateBadge();
    };

    // Safely change button icon without losing badge
    const setButtonIcon = (iconHtml) => {
      const badgeElement = button.querySelector('.livechat-message-badge');
      button.innerHTML = iconHtml;
      if (badgeElement) {
        button.appendChild(badgeElement);
      }
    };

    return {
      incrementUnread,
      resetUnread,
      setButtonIcon,
      unlockAudio
    };
  })();

  // Function to resize textarea
  const resizeTextarea = (textarea) => {
    const maxHeight = 120; // Match CSS max-height
    textarea.style.height = 'auto';
    const newHeight = textarea.scrollHeight;

    if (newHeight <= maxHeight) {
      // If content fits within max height, resize normally
      textarea.style.height = newHeight + 'px';
    } else {
      // If content exceeds max height, set to max and enable scrolling
      textarea.style.height = maxHeight + 'px';
      textarea.style.overflowY = 'auto';
    }
  };


  // Initialize textarea resizing and typing indicator
  const initTextareaResize = () => {
    const textarea = chatWindow.querySelector('.livechat-input');
    if (!textarea) return;

    // Initial resize
    resizeTextarea(textarea);

    // Track typing state to avoid redundant API calls
    let typingTimeout = null;
    let isCurrentlyTyping = false;
    let lastSentTypingTime = 0;
    const TYPING_THROTTLE = 1000; // Only send typing event once per second max

    textarea.addEventListener('input', () => {
      // Always resize the textarea
      resizeTextarea(textarea);

      const hasText = textarea.value.trim().length > 0;
      const currentTime = Date.now();

      // Only proceed if we have a conversation ID
      if (!visitorSession.conversationId) {
        console.warn('No conversation ID yet, typing event not sent.');
        return;
      }

      // Clear any existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Determine if we should send a typing event
      const shouldSendTypingEvent = hasText &&
        (!isCurrentlyTyping || (currentTime - lastSentTypingTime) > TYPING_THROTTLE);

      // Send "started typing" only when state changes or throttle time passed
      if (shouldSendTypingEvent) {
        console.log('TYPING EVENT SENDING:', {
          type: 'start',
          conversation_id: visitorSession.conversationId,
          visitor_id: visitorSession.visitorId,
          current_state: isCurrentlyTyping ? 'already typing' : 'not typing',
          time_since_last: currentTime - lastSentTypingTime + 'ms'
        });

        isCurrentlyTyping = true;
        lastSentTypingTime = currentTime;

        // Send typing started event
        fetch(`${config.apiUrl}/api/widgets/typing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            widget_key: config.key,
            conversation_id: visitorSession.conversationId,
            visitor_id: visitorSession.visitorId,
            is_typing: true
          })
        })
          .catch(err => {
            console.error('Error sending typing start:', err);
            // Reset state so we try again next time
            isCurrentlyTyping = false;
          });
      }

      // Set timeout to send "stopped typing" after 2 seconds of no input
      typingTimeout = setTimeout(() => {
        if (isCurrentlyTyping) {
          console.log('TYPING STOP EVENT SENDING');

          fetch(`${config.apiUrl}/api/widgets/typing`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              widget_key: config.key,
              conversation_id: visitorSession.conversationId,
              visitor_id: visitorSession.visitorId,
              is_typing: false
            })
          })
            .then(() => {
              isCurrentlyTyping = false;
            })
            .catch(err => {
              console.error('Error sending typing stop:', err);
            });
        }
      }, 2000);
    });
  };


  // Detect if mobile or desktop
  const isMobile = () => window.innerWidth < 768;

  // Load existing messages
  const loadMessages = async () => {
    const messagesContainer = chatWindow.querySelector('.livechat-messages');
    const inputArea = chatWindow.querySelector('.livechat-input-area');
    const textarea = chatWindow.querySelector('.livechat-input');
    const sendButton = chatWindow.querySelector('.livechat-send-btn');
    const attachButton = chatWindow.querySelector('.livechat-attach-btn');

    // If we have a conversation ID, load messages
    if (visitorSession.conversationId) {
      const result = await api.getMessages();
      visitorSession.has_more = result.has_more;
      visitorSession.oldest_message_id = result.oldest_message_id;
      renderMessages(messagesContainer, result.messages || []);

      // Subscribe to conversation updates via Pusher
      if (!window._livechatPusher) {
        await initializePusher();
      }

      if (window._livechatPusher) {
        subscribeToConversation(visitorSession.conversationId);
      }

      // Check if the conversation is closed
      const conversationData = await api.getConversationStatus();
      if (conversationData && conversationData.status === 'closed') {
        // Show message that conversation is closed
        const closedMessage = document.createElement('div');
        closedMessage.className = 'livechat-message livechat-message-system';
        closedMessage.innerHTML = 'This conversation is closed. <button class="livechat-new-chat-btn" style="background-color: ' + (config.color || '#3B82F6') + '; color: white; border: none; border-radius: 4px; padding: 5px 10px; margin-top: 5px; cursor: pointer;">Start New Chat</button>';
        messagesContainer.appendChild(closedMessage);

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Disable input area
        textarea.disabled = true;
        textarea.placeholder = 'This conversation is closed';
        sendButton.disabled = true;
        attachButton.style.opacity = '0.5';
        attachButton.style.pointerEvents = 'none';

        // Add event listener to new chat button
        const newChatBtn = closedMessage.querySelector('.livechat-new-chat-btn');
        newChatBtn.addEventListener('click', () => {
          // Reset conversation data
          visitorSession.conversationId = null;
          visitorSession.messages = [];
          saveSession();

          // Re-enable input area
          textarea.disabled = false;
          textarea.placeholder = 'Type your message...';
          sendButton.disabled = false;
          attachButton.style.opacity = '1';
          attachButton.style.pointerEvents = 'auto';

          // Clear messages and show welcome message
          renderMessages(messagesContainer, []);

          // Focus the textarea
          textarea.focus();
        });
      }
    } else {
      // Check if user has previous conversations
      const conversations = await api.getConversationHistory();

      if (conversations && conversations.length > 0) {
        // Find the most recent open conversation if any
        const openConversation = conversations.find(c => c.status === 'open');

        if (openConversation) {
          // Use the open conversation
          visitorSession.conversationId = openConversation.id;
          saveSession();

          // Load messages for this conversation
          const result = await api.getMessages();
          visitorSession.has_more = result.has_more;
          visitorSession.oldest_message_id = result.oldest_message_id;
          renderMessages(messagesContainer, result.messages || []);

          // Subscribe to this conversation
          if (window._livechatPusher) {
            subscribeToConversation(visitorSession.conversationId);
          }
        } else {
          // No open conversations, show welcome message with option to start new
          renderMessages(messagesContainer, []);

          // Add message about previous closed conversations
          const historyMessage = document.createElement('div');
          historyMessage.className = 'livechat-message livechat-message-system';
          historyMessage.textContent = 'Your previous conversations are closed. Type a message to start a new conversation.';
          messagesContainer.appendChild(historyMessage);
        }
      } else {
        // No previous conversations, just show welcome message
        renderMessages(messagesContainer, []);
      }
    }
  };

  // Greeting bubble event handlers
  const greetingCloseBtn = greetingBubble.querySelector('.livechat-greeting-close');
  const greetingContent = greetingBubble.querySelector('.livechat-greeting-content');

  // Close bubble when X is clicked
  greetingCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    greetingBubble.classList.add('hidden');
    greetingBubble.dataset.manuallyClosed = 'true';
  });

  // Open chat when bubble content is clicked
  greetingContent.addEventListener('click', () => {
    if (!chatWindow.classList.contains('active')) {
      button.click(); // Trigger button click to open chat
    }
  });

  // Make bubble content appear clickable
  greetingContent.style.cursor = 'pointer';

  // Toggle chat window when button is clicked
  button.addEventListener('click', () => {
    chatWindow.classList.toggle('active');

    // Apply desktop mode class if on desktop
    if (!isMobile()) {
      chatWindow.classList.toggle('desktop-mode');

      // Ensure proper positioning when in desktop mode
      if (chatWindow.classList.contains('desktop-mode')) {
        if (config.position === 'left') {
          chatWindow.style.setProperty('left', '20px', 'important');
          chatWindow.style.setProperty('right', 'auto', 'important');
        } else {
          chatWindow.style.setProperty('right', '20px', 'important');
          chatWindow.style.setProperty('left', 'auto', 'important');
        }
        chatWindow.style.setProperty('bottom', '90px', 'important');
      }
    }

    // Change button icon and visibility when open
    if (chatWindow.classList.contains('active')) {
      notificationManager.setButtonIcon(icons.times);
      if (isMobile()) {
        // Hide the button on mobile when chat is open
        button.style.display = 'none';
      }

      // Hide greeting bubble when chat opens
      greetingBubble.classList.add('hidden');

      // Ensure chat window has proper pointer events when active
      chatWindow.style.pointerEvents = 'auto';

      // Reset unread count when chat is opened
      notificationManager.resetUnread();

      // Load messages when chat is opened
      loadMessages();
      

      // Focus the textarea when chat opens
      setTimeout(() => {
        chatWindow.querySelector('.livechat-input').focus();
      }, 300);

      // Initialize WebSocket when chat is opened
      if (!window._livechatPusher) {
        initializeWebSocket();
      }
    } else {
      // Chat is closing - restore button icon and show bubble if not manually closed
      // Preserve message badge before restoring icon
      const badgeElement = button.querySelector('.livechat-message-badge');

      if (config.brandLogo) {
        const img = document.createElement('img');
        img.src = config.brandLogo;
        img.alt = 'Chat';
        img.onerror = function() {
          button.innerHTML = getIconSvg(config.icon);
          if (badgeElement) button.appendChild(badgeElement);
        };
        button.innerHTML = '';
        button.appendChild(img);
        if (badgeElement) button.appendChild(badgeElement);
      } else {
        notificationManager.setButtonIcon(getIconSvg(config.icon));
      }
      button.style.display = 'flex';

      // Show greeting bubble again if not manually closed
      if (!greetingBubble.dataset.manuallyClosed) {
        greetingBubble.classList.remove('hidden');
      }
    }

    // Initialize textarea resize
    initTextareaResize();
  });

  // Update on window resize
  window.addEventListener('resize', () => {
    if (chatWindow.classList.contains('active')) {
      if (isMobile()) {
        chatWindow.classList.remove('desktop-mode');
        button.style.display = 'none';
      } else {
        chatWindow.classList.add('desktop-mode');
        button.style.display = 'flex';

        // Re-apply desktop positioning on resize
        if (config.position === 'left') {
          chatWindow.style.setProperty('left', '20px', 'important');
          chatWindow.style.setProperty('right', 'auto', 'important');
        } else {
          chatWindow.style.setProperty('right', '20px', 'important');
          chatWindow.style.setProperty('left', 'auto', 'important');
        }
        chatWindow.style.setProperty('bottom', '90px', 'important');
      }
    }
  });


  // Close chat when close button is clicked
  const closeButton = chatWindow.querySelector('.livechat-close-btn');
  closeButton.addEventListener('click', (e) => {
    e.stopPropagation();

    // If we have a conversation, show the feedback modal, otherwise just close
    if (visitorSession.conversationId) {
      showFeedbackModal();
    } else {
      closeChat();
    }

    // Helper function to close the chat window
    function closeChat() {
      chatWindow.classList.remove('active');
      chatWindow.classList.remove('desktop-mode');

      // Preserve message badge before restoring icon
      const badgeElement = button.querySelector('.livechat-message-badge');

      // Restore brand logo or icon
      if (config.brandLogo) {
        const img = document.createElement('img');
        img.src = config.brandLogo;
        img.alt = 'Chat';
        img.onerror = function() {
          button.innerHTML = getIconSvg(config.icon);
          if (badgeElement) button.appendChild(badgeElement);
        };
        button.innerHTML = '';
        button.appendChild(img);
        if (badgeElement) button.appendChild(badgeElement);
      } else {
        notificationManager.setButtonIcon(getIconSvg(config.icon));
      }

      button.style.display = 'flex';
      chatWindow.style.pointerEvents = 'none';

      // Show greeting bubble again if not manually closed
      if (!greetingBubble.dataset.manuallyClosed) {
        greetingBubble.classList.remove('hidden');
      }

      const filePreviewArea = chatWindow.querySelector('.livechat-file-preview');
      if (filePreviewArea) {
        filePreviewArea.style.display = 'none';
        filePreviewArea.innerHTML = '';
      }
    }

    // Helper function to show the feedback modal
    function showFeedbackModal() {
      // Create and show the close confirmation modal
      const modalOverlay = document.createElement('div');
      modalOverlay.className = 'livechat-modal-overlay';
      modalOverlay.style.position = 'absolute';
      modalOverlay.style.top = '0';
      modalOverlay.style.left = '0';
      modalOverlay.style.right = '0';
      modalOverlay.style.bottom = '0';
      modalOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      modalOverlay.style.zIndex = '10001';
      modalOverlay.style.display = 'flex';
      modalOverlay.style.alignItems = 'center';
      modalOverlay.style.justifyContent = 'center';

      const darkMode = isDarkMode();
      const modal = document.createElement('div');
      modal.className = 'livechat-feedback-modal';
      modal.style.backgroundColor = darkMode ? '#1f2937' : '#fff';
      modal.style.color = darkMode ? '#f3f4f6' : '#1f2937';
      modal.style.borderRadius = '12px';
      modal.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.2)';
      modal.style.width = '90%';
      modal.style.maxWidth = '320px';
      modal.style.maxHeight = '90%';
      modal.style.padding = '20px';
      modal.style.overflow = 'auto';

      modal.innerHTML = `
      <div style="margin-bottom: 15px; font-size: 16px; font-weight: 600; color: ${darkMode ? '#f3f4f6' : '#1f2937'};">End this conversation?</div>

      <div style="margin-bottom: 20px;">
        <div style="margin-bottom: 10px; font-size: 14px; color: ${darkMode ? '#d1d5db' : '#4a5568'};">How would you rate this conversation?</div>
        <div class="livechat-rating" style="display: flex; margin-bottom: 15px;">
          <button class="livechat-rating-btn" data-rating="1" style="flex: 1; padding: 8px; margin: 0 4px; border: 1px solid ${darkMode ? '#4b5563' : '#e0e0e0'}; background: ${darkMode ? '#374151' : '#f8f9fa'}; color: ${darkMode ? '#f3f4f6' : '#000'}; border-radius: 4px; cursor: pointer;">1</button>
          <button class="livechat-rating-btn" data-rating="2" style="flex: 1; padding: 8px; margin: 0 4px; border: 1px solid ${darkMode ? '#4b5563' : '#e0e0e0'}; background: ${darkMode ? '#374151' : '#f8f9fa'}; color: ${darkMode ? '#f3f4f6' : '#000'}; border-radius: 4px; cursor: pointer;">2</button>
          <button class="livechat-rating-btn" data-rating="3" style="flex: 1; padding: 8px; margin: 0 4px; border: 1px solid ${darkMode ? '#4b5563' : '#e0e0e0'}; background: ${darkMode ? '#374151' : '#f8f9fa'}; color: ${darkMode ? '#f3f4f6' : '#000'}; border-radius: 4px; cursor: pointer;">3</button>
          <button class="livechat-rating-btn" data-rating="4" style="flex: 1; padding: 8px; margin: 0 4px; border: 1px solid ${darkMode ? '#4b5563' : '#e0e0e0'}; background: ${darkMode ? '#374151' : '#f8f9fa'}; color: ${darkMode ? '#f3f4f6' : '#000'}; border-radius: 4px; cursor: pointer;">4</button>
          <button class="livechat-rating-btn" data-rating="5" style="flex: 1; padding: 8px; margin: 0 4px; border: 1px solid ${darkMode ? '#4b5563' : '#e0e0e0'}; background: ${darkMode ? '#374151' : '#f8f9fa'}; color: ${darkMode ? '#f3f4f6' : '#000'}; border-radius: 4px; cursor: pointer;">5</button>
        </div>

        <div style="margin-bottom: 10px; font-size: 14px; color: ${darkMode ? '#d1d5db' : '#4a5568'};">Feedback (optional):</div>
        <textarea class="livechat-feedback-text" style="width: 100%; padding: 8px; border: 1px solid ${darkMode ? '#4b5563' : '#e0e0e0'}; background: ${darkMode ? '#374151' : '#fff'}; color: ${darkMode ? '#f3f4f6' : '#1f2937'}; border-radius: 6px; min-height: 80px; resize: vertical;"></textarea>
      </div>

      <div style="display: flex; justify-content: space-between;">
        <button class="livechat-modal-cancel" style="padding: 10px 16px; border: 1px solid ${darkMode ? '#4b5563' : '#e0e0e0'}; background: ${darkMode ? '#374151' : '#f5f5f5'}; color: ${darkMode ? '#f3f4f6' : '#000'}; border-radius: 6px; cursor: pointer;">Cancel</button>
        <button class="livechat-modal-later" style="padding: 10px 16px; border: 1px solid ${darkMode ? '#4b5563' : '#e0e0e0'}; background: ${darkMode ? '#374151' : '#f5f5f5'}; color: ${darkMode ? '#f3f4f6' : '#000'}; border-radius: 6px; cursor: pointer; margin-left: 5px;">I'll be back</button>
        <button class="livechat-modal-close" style="padding: 10px 16px; background-color: ${config.color || '#3B82F6'}; color: white; border: none; border-radius: 6px; cursor: pointer; margin-left: 5px;">Close Chat</button>
      </div>
    `;

      modalOverlay.appendChild(modal);
      chatWindow.appendChild(modalOverlay);

      // Add event listeners to rating buttons
      let selectedRating = null;
      const ratingButtons = modal.querySelectorAll('.livechat-rating-btn');
      ratingButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          // Clear previous selection
          ratingButtons.forEach(b => {
            b.style.backgroundColor = '#f8f9fa';
            b.style.color = '#000';
            b.style.fontWeight = 'normal';
          });

          // Set new selection
          selectedRating = parseInt(btn.getAttribute('data-rating'));
          btn.style.backgroundColor = config.color || '#3B82F6';
          btn.style.color = '#fff';
          btn.style.fontWeight = 'bold';
        });
      });

      // Cancel button - just close the modal
      const cancelButton = modal.querySelector('.livechat-modal-cancel');
      cancelButton.addEventListener('click', () => {
        chatWindow.removeChild(modalOverlay);
      });

      // "I'll be back" button - just close the modal and chat window
      const laterButton = modal.querySelector('.livechat-modal-later');
      laterButton.addEventListener('click', () => {
        chatWindow.removeChild(modalOverlay);
        closeChat();
      });

      // Close Chat button - submit rating and close conversation
      const closeConfirmButton = modal.querySelector('.livechat-modal-close');
      closeConfirmButton.addEventListener('click', async () => {
        const feedback = modal.querySelector('.livechat-feedback-text').value.trim();

        // Show loading state
        closeConfirmButton.innerHTML = '<div class="livechat-spinner-small"></div>';
        closeConfirmButton.disabled = true;

        // Submit rating if one was selected
        if (selectedRating || feedback) {
          try {
            await submitConversationFeedback(selectedRating, feedback);
          } catch (error) {
            console.error('Error submitting feedback:', error);
          }
        }

        // Close conversation on server if it's open
        try {
          await closeConversation();
        } catch (error) {
          console.error('Error closing conversation:', error);
        }

        // Close the modal and chat window
        // Stop any active polling
        messagePollManager.stopPolling();
        chatWindow.removeChild(modalOverlay);
        closeChat();

        // Add the conversation closure to messages
        const systemMessage = document.createElement('div');
        systemMessage.className = 'livechat-message livechat-message-system';
        systemMessage.textContent = 'You closed this conversation. Start a new chat if you need more help.';
        messagesContainer.appendChild(systemMessage);
      });
    }
  });

  const initializeWebSocket = () => {
    // Initialize Pusher
    initializePusher().then(pusher => {
      if (pusher && visitorSession.conversationId) {
        console.log('WebSocket initialized and subscribed to conversation');
      }
    });
  };

  // Helper function to submit conversation feedback
  const submitConversationFeedback = async (rating, comment) => {
    if (!visitorSession.conversationId) return;

    try {
      const formData = new FormData();
      formData.append('widget_key', config.key);
      formData.append('conversation_id', visitorSession.conversationId);

      if (rating) {
        formData.append('rating', rating);
      }

      if (comment) {
        formData.append('comment', comment);
      }

      const response = await fetch(`${config.apiUrl}/api/widgets/conversations/rate`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        console.error('Failed to submit feedback:', response.status);
      }

      return response.ok;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      return false;
    }
  };

  // Helper function to close the conversation on the server
  const closeConversation = async () => {
    if (!visitorSession.conversationId) return;

    try {
      const formData = new FormData();
      formData.append('widget_key', config.key);
      formData.append('conversation_id', visitorSession.conversationId);
      formData.append('close_reason', 'visitor_closed');

      const response = await fetch(`${config.apiUrl}/api/widgets/conversations/close`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        console.error('Failed to close conversation:', response.status);
      }

      return response.ok;
    } catch (error) {
      console.error('Error closing conversation:', error);
      return false;
    }
  };

  // Handle file upload and preview
  let selectedFile = null;
  const fileInput = chatWindow.querySelector('.livechat-file-input');
  const filePreviewArea = chatWindow.querySelector('.livechat-file-preview');

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      selectedFile = e.target.files[0];

      // Clear any existing preview
      filePreviewArea.innerHTML = '';

      // Create a new preview
      const removeCallback = () => {
        selectedFile = null;
        filePreviewArea.style.display = 'none';
        filePreviewArea.innerHTML = '';
        fileInput.value = '';
      };

      const previewElement = createFilePreview(selectedFile, removeCallback);
      filePreviewArea.appendChild(previewElement);
      filePreviewArea.style.display = 'flex';
    }
  });

  // Send message functionality
  const messagesContainer = chatWindow.querySelector('.livechat-messages');
  const sendButton = chatWindow.querySelector('.livechat-send-btn');
  const textarea = chatWindow.querySelector('.livechat-input');

const sendMessage = async () => {
  const message = textarea.value.trim();
  const fileToSend = selectedFile;
  
  // Don't do anything if there's nothing to send
  if (!message && !fileToSend) return;
  
  // CHECK IF THIS IS A NEW CONVERSATION *BEFORE* SENDING
  const isFirstMessage = !visitorSession.conversationId;
  
  console.log('📤 Sending message...');
  console.log('Is this the first message?', isFirstMessage);
  console.log('Current conversation ID:', visitorSession.conversationId);
  
  // Add temporary message to UI
  if (message) {
    const userMessage = document.createElement('div');
    userMessage.className = 'livechat-message livechat-message-user';
    userMessage.textContent = message;
    
    const timeEl = document.createElement('div');
    timeEl.className = 'livechat-message-time';
    timeEl.textContent = formatTime(new Date());
    userMessage.appendChild(timeEl);
    
    messagesContainer.appendChild(userMessage);
  }
  
  // For file, show a temporary preview message
  if (fileToSend) {
    const userFileMessage = document.createElement('div');
    userFileMessage.className = 'livechat-message livechat-message-user';
    
    if (fileToSend.type.startsWith('image/')) {
      userFileMessage.classList.add('livechat-message-image');
      
      // Create a local preview of the image
      const reader = new FileReader();
      reader.onload = (e) => {
        userFileMessage.innerHTML = `<img src="${e.target.result}" alt="Image">`;
        
        // Add timestamp
        const timeEl = document.createElement('div');
        timeEl.className = 'livechat-message-time';
        timeEl.textContent = formatTime(new Date());
        userFileMessage.appendChild(timeEl);
      };
      reader.readAsDataURL(fileToSend);
    } else {
      userFileMessage.classList.add('livechat-message-file');
      userFileMessage.innerHTML = `
        <div class="livechat-message-file-icon">${icons.file}</div>
        <div class="livechat-message-file-info">
          <div class="livechat-message-file-name">${fileToSend.name}</div>
          <div class="livechat-message-file-size">${formatFileSize(fileToSend.size)}</div>
        </div>
      `;
      
      // Add timestamp
      const timeEl = document.createElement('div');
      timeEl.className = 'livechat-message-time';
      timeEl.textContent = formatTime(new Date());
      userFileMessage.appendChild(timeEl);
    }
    
    messagesContainer.appendChild(userFileMessage);
  }
  
  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  // Clear textarea and reset height
  textarea.value = '';
  textarea.style.height = 'auto';
  
  // Clear file preview
  if (filePreviewArea) {
    filePreviewArea.style.display = 'none';
    filePreviewArea.innerHTML = '';
  }
  
  try {
  // Send message to server
  const result = await api.sendMessage(message, fileToSend);
  console.log('✅ Message sent successfully:', result);
  
  // If this was the FIRST message, reinitialize Pusher
  if (isFirstMessage) {
    console.log('🆕 First message detected! Reinitializing Pusher...');

    // If there's an auto_reply in the result, display it immediately
    if (result && result.auto_reply) {
      console.log('📨 Displaying auto_reply from API response:', result.auto_reply);
      const autoReplyEl = createMessageElement(result.auto_reply);
      messagesContainer.appendChild(autoReplyEl);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Show a connecting message with animated dots
    const systemMessage = document.createElement('div');
    systemMessage.className = 'livechat-message livechat-message-system';
    systemMessage.id = 'connecting-message';
    systemMessage.innerHTML = 'Connecting to an agent<span class="connecting-dots"></span>';
    messagesContainer.appendChild(systemMessage);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Animate the dots (...)
    let dotCount = 0;
    const dotInterval = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      const dots = '.'.repeat(dotCount);
      const dotsSpan = systemMessage.querySelector('.connecting-dots');
      if (dotsSpan) {
        dotsSpan.textContent = dots;
      }
    }, 500);
    
    // Store the interval ID so we can clear it later
    window._connectingDotsInterval = dotInterval;
    
    // Notify admin after 10 seconds
    setTimeout(async () => {
      try {
        console.log('📧 Notifying admin of new visitor...');
        
        const response = await fetch(`${config.apiUrl}/api/widgets/new-connection`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            widget_key: config.key,
            conversation_id: visitorSession.conversationId,
            visitor_id: visitorSession.visitorId
          })
        });
        
        const data = await response.json();
        console.log('✅ Admin notified:', data.message);
        
      } catch (error) {
        console.error('❌ Error notifying admin:', error);
        // Don't show error to user, just log it
      }
    }, 10000); // 10 seconds
    
    // Now reinitialize Pusher
    setTimeout(async () => {
      try {
        console.log('🔄 Disconnecting old Pusher...');
        
        // Completely disconnect and destroy old Pusher
        if (window._livechatPusher) {
          window._livechatPusher.disconnect();
          delete window._livechatPusher;
          window._livechatPusher = null;
        }
        
        console.log('🔌 Initializing new Pusher with conversation ID:', visitorSession.conversationId);
        
        // Reinitialize Pusher (it will now see the conversation ID)
        await initializePusher();

        console.log('✅ Pusher reinitialized successfully!');
        
      } catch (error) {
        console.error('❌ Error reinitializing Pusher:', error);
      }
    }, 500);
    
    return; // Don't continue execution
  }
  
  // Reset selected file
  selectedFile = null;
  if (fileInput) fileInput.value = '';
  
} catch (error) {
  console.error('❌ Error sending message:', error);
  
  // Show error message
  const errorMessage = document.createElement('div');
  errorMessage.className = 'livechat-message livechat-message-system';
  errorMessage.textContent = 'Failed to send message. Please try again.';
  messagesContainer.appendChild(errorMessage);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}



};




  // Send on button click
  let sendInProgress = false;
  const handleSend = async () => {
    if (sendInProgress) return;
    sendInProgress = true;

    try {
      // Unlock audio when user sends first message
      await notificationManager.unlockAudio();
      await sendMessage();
    } finally {
      // Reset flag after a short delay to prevent double-firing
      setTimeout(() => {
        sendInProgress = false;
      }, 300);
    }
  };

  // Handle click events (works on both desktop and mobile)
  sendButton.addEventListener('click', async (e) => {
    e.preventDefault();
    await handleSend();
  });

  // Handle touch events for mobile as backup
  sendButton.addEventListener('touchstart', async (e) => {
    e.preventDefault();
    await handleSend();
  });

  // Send on Enter key (without shift)
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Prevent new line
      sendMessage();
    }
  });

  // Function to ensure the chat stays on top of all elements
  const ensureChatOnTop = () => {
    // Re-apply maximum z-index to chat elements
    container.style.setProperty('z-index', '2147483647', 'important');
    button.style.setProperty('z-index', '2147483647', 'important');
    chatWindow.style.setProperty('z-index', '2147483646', 'important');

    // Ensure container is a direct child of body
    if (container.parentNode !== document.body) {
      document.body.appendChild(container);
    }
  };

  // Run this on scroll and after any page content changes
  window.addEventListener('scroll', ensureChatOnTop);
  window.addEventListener('load', ensureChatOnTop);

  // Also run periodically to handle dynamic content
  setInterval(ensureChatOnTop, 2000);

  // Initialize session
  loadSession();

  // WebSocket functionality with Pusher
  const initializePusher = async () => {
    try {
      await loadPusher();

      if (!window.Pusher) {
        console.error('Pusher library not available after loading');
        return null;
      }

      // Initialize Pusher with your credentials
      const pusher = new Pusher('38b5c6c6e09853ed572a', {
        cluster: 'eu',
        encrypted: true
      });

      console.log('Pusher initialized successfully');

      // Store the Pusher instance for later use
      window._livechatPusher = pusher;

      // If we have an active conversation, subscribe to its channel
      if (visitorSession.conversationId) {
        subscribeToConversation(visitorSession.conversationId);
      }

      return pusher;
    } catch (error) {
      console.error('Error initializing Pusher:', error);
      return null;
    }
  };


  // Helper function to subscribe to a conversation channel
// Helper function to subscribe to a conversation channel
const subscribeToConversation = (conversationId) => {
  console.log(`Setting up subscription to channel: conversation.${conversationId}`);
  if (!window._livechatPusher) {
    console.error('Pusher not initialized');
    return null;
  }

  const channelName = `conversation.${conversationId}`;
  const channel = window._livechatPusher.subscribe(channelName);

  console.log(`Attempting to subscribe to channel: ${channelName}`);

  channel.bind('pusher:subscription_succeeded', () => {
    console.log(`✅ Successfully subscribed to channel: ${channelName}`);
  });

  channel.bind('pusher:subscription_error', (error) => {
    console.error(`Error subscribing to channel: ${channelName}`, error);
  });

  // Listen for new messages in standard format codedweb
  channel.bind('new-message', function(data) {
    console.log('🔔 New message received via Pusher:', data);
    
    // Only process messages not from the current visitor
    if (data.sender_type !== 'visitor') {
      // Check if this message is already in our list by ID
      const messageExists = visitorSession.messages.some(m => m.id === data.id);
      
      if (!messageExists) {
        console.log('Adding new agent message to UI:', data);
        
        // Add message to the conversation
        visitorSession.messages.push(data);
        saveSession();
        
        // Update UI if chat is open
        const messagesContainer = chatWindow.querySelector('.livechat-messages');
        if (messagesContainer && chatWindow.classList.contains('active')) {
          // Create a new message element
          const messageEl = document.createElement('div');
          
          // Set the message class
          let className = 'livechat-message ';
          if (data.sender_type === 'system') {
            className += 'livechat-message-system';
          } else {
            className += 'livechat-message-agent';
          }
          
          // Add class for file types
          if (data.type === 'image') {
            className += ' livechat-message-image';
          } else if (data.type === 'file') {
            className += ' livechat-message-file';
          }
          
          messageEl.className = className;

          // Add sender name for agent/bot messages
          if (data.sender_name && data.sender_type !== 'visitor') {
            const senderNameEl = document.createElement('div');
            senderNameEl.className = 'livechat-sender-name';
            senderNameEl.textContent = data.sender_name;
            messageEl.appendChild(senderNameEl);
          }

          // Create content wrapper
          const contentWrapper = document.createElement('div');
          contentWrapper.className = 'livechat-message-content';

          // Set content based on message type
          if (data.type === 'text') {
            contentWrapper.textContent = data.content;
          } else if (data.type === 'image') {
            contentWrapper.innerHTML = `<img src="${data.file_url}" alt="Image">`;
          } else if (data.type === 'file') {
            contentWrapper.innerHTML = `
              <a href="${data.file_url}" target="_blank">
                <div class="livechat-message-file-icon">${icons.file}</div>
                <div class="livechat-message-file-info">
                  <div class="livechat-message-file-name">${data.file_name || 'File'}</div>
                  <div class="livechat-message-file-size">${formatFileSize(data.file_size || 0)}</div>
                </div>
              </a>
            `;
          } else {
            contentWrapper.textContent = data.content;
          }

          messageEl.appendChild(contentWrapper);
          
          // Add timestamp
          const timeEl = document.createElement('div');
          timeEl.className = 'livechat-message-time';
          timeEl.textContent = formatTime(data.created_at);
          messageEl.appendChild(timeEl);
          
          // Add to UI and scroll
          messagesContainer.appendChild(messageEl);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;

          // Hide typing indicator
          const typingIndicator = chatWindow.querySelector('.livechat-typing');
          if (typingIndicator) {
            typingIndicator.style.display = 'none';
          }
        }

        // Increment unread count and play sound if chat is closed
        notificationManager.incrementUnread();
      }
    }
  });

  // Listen for Laravel event format messages
  channel.bind('App\\Events\\NewMessage', function(data) {
    console.log('🔔 New message received via Laravel event:', data);
    
    // Check if the message data is in the expected format
    if (data.message && data.message.sender_type !== 'visitor') {
      // The actual message is in data.message
      const message = data.message;
      
      // Check if this message is already in our list by ID
      const messageExists = visitorSession.messages.some(m => m.id === message.id);
      
      if (!messageExists) {
        console.log('Adding new agent message to UI:', message);
        
        // Add message to the conversation
        visitorSession.messages.push(message);
        saveSession();
        
        // Update UI if chat is open
        const messagesContainer = chatWindow.querySelector('.livechat-messages');
        if (messagesContainer && chatWindow.classList.contains('active')) {
          // Add the message to the UI
          const messageEl = createMessageElement(message);
          messagesContainer.appendChild(messageEl);
          messagesContainer.scrollTop = messagesContainer.scrollHeight;

          // Hide typing indicator
          const typingIndicator = chatWindow.querySelector('.livechat-typing');
          if (typingIndicator) {
            typingIndicator.style.display = 'none';
          }
          // Remove the connecting message if it exists
          const connectingMessage = document.getElementById('connecting-message');
          if (connectingMessage) {
            connectingMessage.remove();
          }
        }

        // Increment unread count and play sound if chat is closed
        notificationManager.incrementUnread();
      }
    }
  });

// Listen for typing indicators
channel.bind('typing', (data) => {
  console.log('👀 Typing event received:', data);

  // ✅ Show/hide typing indicator when agent or bot is typing (NOT visitor)
  // Check sender_type explicitly instead of comparing visitor IDs
  if (data.sender_type === 'agent' || data.sender_type === 'bot') {
    const typingIndicator = chatWindow.querySelector('.livechat-typing');
    if (typingIndicator) {
      // Update indicator text based on sender type
      const indicatorText = data.sender_type === 'bot' ? 'AI Assistant is typing' : 'Agent is typing';
      const textNode = typingIndicator.childNodes[0];
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        textNode.textContent = indicatorText + '\n  ';
      }

      typingIndicator.style.display = data.is_typing ? 'block' : 'none';

      // Scroll to show typing indicator
      if (data.is_typing) {
        const messagesContainer = chatWindow.querySelector('.livechat-messages');
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // ✨ Remove "Connecting to agent" message when agent/bot starts typing
        const connectingMsg = document.getElementById('connecting-message');
        if (connectingMsg) {
          console.log('✅ Agent/Bot is typing! Removing connecting message...');

          // Clear the dots animation
          if (window._connectingDotsInterval) {
            clearInterval(window._connectingDotsInterval);
            window._connectingDotsInterval = null;
          }

          // Remove the connecting message
          connectingMsg.remove();
        }
      }
    }
  }
});

  // Listen for conversation closed event
  channel.bind('conversation-closed', (data) => {
    console.log('🔒 Conversation closed event received:', data);

    const messagesContainer = chatWindow.querySelector('.livechat-messages');
    const textarea = chatWindow.querySelector('.livechat-textarea');
    const sendButton = chatWindow.querySelector('.livechat-send-btn');
    const attachButton = chatWindow.querySelector('.livechat-attach-btn');

    if (messagesContainer && chatWindow.classList.contains('active')) {
      // Show closed message
      const closedMessage = document.createElement('div');
      closedMessage.className = 'livechat-message livechat-message-system';
      closedMessage.innerHTML = 'This conversation has been closed. <button class="livechat-new-chat-btn" style="background-color: ' + (config.color || '#3B82F6') + '; color: white; border: none; border-radius: 4px; padding: 5px 10px; margin-top: 5px; cursor: pointer;">Start New Chat</button>';
      messagesContainer.appendChild(closedMessage);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      // Disable input
      if (textarea) {
        textarea.disabled = true;
        textarea.placeholder = 'This conversation is closed';
      }
      if (sendButton) sendButton.disabled = true;
      if (attachButton) {
        attachButton.style.opacity = '0.5';
        attachButton.style.pointerEvents = 'none';
      }

      // Add new chat button handler
      const newChatBtn = closedMessage.querySelector('.livechat-new-chat-btn');
      if (newChatBtn) {
        newChatBtn.addEventListener('click', () => {
          visitorSession.conversationId = null;
          visitorSession.messages = [];
          saveSession();

          if (textarea) {
            textarea.disabled = false;
            textarea.placeholder = 'Type your message...';
          }
          if (sendButton) sendButton.disabled = false;
          if (attachButton) {
            attachButton.style.opacity = '1';
            attachButton.style.pointerEvents = 'auto';
          }

          renderMessages(messagesContainer, []);
          if (textarea) textarea.focus();
        });
      }
    }
  });

  return channel;
};

  const createMessageElement = (message) => {
  const messageEl = document.createElement('div');

  // Determine message class based on sender type
  let className = 'livechat-message ';
  if (message.sender_type === 'visitor') {
    className += 'livechat-message-user';
  } else if (message.sender_type === 'system') {
    className += 'livechat-message-system';
  } else {
    className += 'livechat-message-agent';
  }

  // Add additional class based on message type
  if (message.type === 'image') {
    className += ' livechat-message-image';
  } else if (message.type === 'file') {
    className += ' livechat-message-file';
  }

  messageEl.className = className;

  // Add sender name for agent/bot messages
  if (message.sender_name && message.sender_type !== 'visitor') {
    const senderNameEl = document.createElement('div');
    senderNameEl.className = 'livechat-sender-name';
    senderNameEl.textContent = message.sender_name;
    messageEl.appendChild(senderNameEl);
  }

  // Create content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.className = 'livechat-message-content';

  // Set content based on message type
  if (message.type === 'text') {
    contentWrapper.innerHTML = linkifyText(message.content);
  } else if (message.type === 'image') {
    contentWrapper.innerHTML = `<img src="${message.file_url}" alt="Image">`;
  } else if (message.type === 'file') {
    contentWrapper.innerHTML = `
      <a href="${message.file_url}" target="_blank">
        <div class="livechat-message-file-icon">${icons.file}</div>
        <div class="livechat-message-file-info">
          <div class="livechat-message-file-name">${message.file_name || 'File'}</div>
          <div class="livechat-message-file-size">${formatFileSize(message.file_size || 0)}</div>
        </div>
      </a>
    `;
  } else {
    contentWrapper.innerHTML = linkifyText(message.content);
  }

  messageEl.appendChild(contentWrapper);

  // Add timestamp
  const timeEl = document.createElement('div');
  timeEl.className = 'livechat-message-time';
  timeEl.textContent = formatTime(message.created_at);
  messageEl.appendChild(timeEl);

  return messageEl;
};

  // Initialize Pusher when the widget loads
  initializePusher();

  // Initialize polling on conversation load


  // Heartbeat to notify server the widget is active
  const startHeartbeat = () => {
    // Initial heartbeat on load
    sendHeartbeat();

    // Set interval for regular heartbeats (every 30 seconds)
    const heartbeatInterval = setInterval(sendHeartbeat, 50000);

    // Store interval ID to clear on unload
    window._livechatHeartbeatInterval = heartbeatInterval;

    // Also send heartbeat on visibility change (tab focus)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    });
  };

  // Send heartbeat to server
  const sendHeartbeat = async () => {
    try {
      const data = {
        widget_key: config.key,
        visitor_id: visitorSession.visitorId,
        conversation_id: visitorSession.conversationId || null,
        url: window.location.href,
        referrer: document.referrer,
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen_size: `${window.screen.width}x${window.screen.height}`,
        browser_language: navigator.language,
        is_mobile: isMobile(),
        page_title: document.title
      };

      // Use fetch instead of sendBeacon to avoid ad blocker detection
      fetch(`${config.apiUrl}/api/widgets/chat-activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        // Use keepalive to ensure the request completes even if page unloads
        keepalive: true
      }).catch(e => {
        console.error('Chat activity error:', e);
      });
    } catch (error) {
      console.error('Error sending chat activity update:', error);
    }
  };

  // Start heartbeat when the script loads
  startHeartbeat();

  // Add an event listener for when the page unloads
  window.addEventListener('beforeunload', () => {
    // Clear the heartbeat interval
    if (window._livechatHeartbeatInterval) {
      clearInterval(window._livechatHeartbeatInterval);
    }

    // Send a final heartbeat with unload flag
    try {
      const data = {
        widget_key: config.key,
        visitor_id: visitorSession.visitorId,
        conversation_id: visitorSession.conversationId || null,
        url: window.location.href,
        event: 'page_unload',
        timestamp: new Date().toISOString()
      };

      // Use sendBeacon for reliable delivery during page unload
      if (navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        navigator.sendBeacon(`${config.apiUrl}/api/widgets/heartbeat`, blob);
      }
    } catch (error) {
      console.error('Error sending final heartbeat:', error);
    }
  });

  // Check domain verification before showing widget
  const checkVerification = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/widgets/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          widget_key: config.key,
          domain: window.location.hostname,
          page_url: window.location.href
        })
      });

      const data = await response.json();
      console.log('Verification response data:', data);

      if (data.status === 'success' && data.verified === true) {
        console.log('Widget verification successful');

        // Widget is verified, it can be shown
        container.style.display = 'block';

        // Ensure proper positioning after showing
        ensureChatOnTop();
      } else {
        console.error('Widget not verified for this domain');

        // Hide widget if not verified
        container.style.display = 'none';
      }
    } catch (error) {
      console.error('Error during widget verification:', error);

      // Hide widget on error
      container.style.display = 'none';
    }
  };

  // Initially hide widget until verified
  container.style.display = 'none';

  // Verify widget when loaded
  setTimeout(() => {
    checkVerification();
    // Apply positioning fixes after a delay to ensure they override any other styles
    setTimeout(ensureChatOnTop, 500);
  }, 1000);
})();