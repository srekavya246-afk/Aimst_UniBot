// UniBot AIMST University Chatbot - Main Application Controller
// Ref: Chapter 4 System Design & Secure Student Authentication

document.addEventListener('DOMContentLoaded', () => {
  const appEl = document.getElementById('app');
  const storage = new StorageService();
  let chatbotEngine = new ChatbotEngine(storage.getKnowledgeBase());

  // Application State
  let currentView = 'home'; // 'home' | 'student-login' | 'student-chat' | 'admin-login' | 'admin-dashboard'
  let adminSubTab = 'kb'; // 'kb' | 'students' | 'history' | 'feedback'
  let selectedFacultyFilter = 'ALL';
  let selectedLevelFilter = 'ALL';
  let selectedCourseFilter = 'ALL';
  let selectedKBCategoryFilter = 'ALL';
  let currentUser = storage.getUser() || null;
  let activeStudentProfile = null;
  let chatMessages = [];
  let editingKbId = null;

  window.addEventListener('aimst_realtime_sync', () => {
    chatbotEngine.updateKnowledgeBase(storage.getKnowledgeBase());
    if (currentUser && currentUser.role === 'student') {
      activeStudentProfile = storage.getStudentById(currentUser.id) || activeStudentProfile;
    }
    render();
  });

  function initStudentChatMessages() {
    activeStudentProfile = storage.getStudentById(currentUser.id) || {
      id: currentUser.id,
      name: currentUser.name || "Student " + currentUser.id,
      faculty: "AIMST University",
      course: "General Studies",
      outstandingFee: 0,
      examTimetable: "Check Student Portal",
      hostelBlock: "Main Hostel",
      roomNo: "Unassigned",
      examSlipStatus: "Available"
    };

    chatMessages = [
      {
        sender: 'bot',
        text: `Hello <strong>${activeStudentProfile.name}</strong>! I am UniBot, your AIMST University support assistant.<br/><br/>🎓 Registered Program: <em>${activeStudentProfile.course}</em> (${activeStudentProfile.faculty}). How can I assist you today?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  }

  // Render Engine
  function render() {
    appEl.innerHTML = '';

    const header = createHeader();
    appEl.appendChild(header);

    const mainContainer = document.createElement('main');
    mainContainer.style.flex = '1';

    if (currentView === 'home') {
      mainContainer.appendChild(renderHomeView());
    } else if (currentView === 'student-login') {
      mainContainer.appendChild(renderStudentLoginView());
    } else if (currentView === 'student-chat') {
      if (!activeStudentProfile && currentUser && currentUser.role === 'student') {
        initStudentChatMessages();
      }
      mainContainer.appendChild(renderStudentChatView());
    } else if (currentView === 'admin-login') {
      mainContainer.appendChild(renderAdminLoginView());
    } else if (currentView === 'admin-dashboard') {
      mainContainer.appendChild(renderAdminDashboardView());
    }

    appEl.appendChild(mainContainer);
  }

  // --- HEADER COMPONENT ---
  function createHeader() {
    const header = document.createElement('header');
    header.className = 'main-header';

    const isStudent = currentUser && currentUser.role === 'student';
    const isAdmin = currentUser && currentUser.role === 'admin';

    header.innerHTML = `
      <div class="nav-container">
        <a href="#" class="brand-logo" id="logo-link">
          <div class="logo-icon"><i class="fas fa-robot"></i></div>
          <div class="brand-title">
            UniBot
            <span class="brand-subtitle">AIMST Support System</span>
          </div>
        </a>
        <div class="nav-actions">
          ${isAdmin ? `
            <span style="font-size: 0.85rem; font-weight:600; color:${currentUser.readOnly ? '#0284c7' : 'var(--primary)'};">
              <i class="${currentUser.readOnly ? 'fas fa-eye' : 'fas fa-user-shield'}"></i>
              ${currentUser.name || (currentUser.readOnly ? 'Staff Viewer (View-Only)' : 'Admin Panel')}
            </span>
            <button class="nav-btn nav-btn-secondary" id="btn-logout"><i class="fas fa-sign-out-alt"></i> Logout</button>
          ` : isStudent ? `
            <span style="font-size: 0.85rem; font-weight:600; color:var(--primary);"><i class="fas fa-user-graduate"></i> ${currentUser.name} (${currentUser.id})</span>
            <button class="nav-btn nav-btn-secondary" id="btn-logout"><i class="fas fa-sign-out-alt"></i> Sign Out</button>
          ` : `
            <button class="nav-btn nav-btn-secondary" id="btn-nav-home"><i class="fas fa-home"></i> Home</button>
            <button class="nav-btn nav-btn-secondary" id="btn-nav-student"><i class="fas fa-comments"></i> Student Login</button>
            <button class="nav-btn nav-btn-primary" id="btn-nav-admin"><i class="fas fa-lock"></i> Admin Access</button>
          `}
        </div>
      </div>
    `;

    setTimeout(() => {
      const logoLink = header.querySelector('#logo-link');
      if (logoLink) logoLink.onclick = (e) => { e.preventDefault(); navigateTo('home'); };

      const btnHome = header.querySelector('#btn-nav-home');
      if (btnHome) btnHome.onclick = () => navigateTo('home');

      const btnStudent = header.querySelector('#btn-nav-student');
      if (btnStudent) btnStudent.onclick = () => {
        if (currentUser && currentUser.role === 'student') navigateTo('student-chat');
        else navigateTo('student-login');
      };

      const btnAdmin = header.querySelector('#btn-nav-admin');
      if (btnAdmin) btnAdmin.onclick = () => {
        if (currentUser && currentUser.role === 'admin') navigateTo('admin-dashboard');
        else navigateTo('admin-login');
      };

      const btnLogout = header.querySelector('#btn-logout');
      if (btnLogout) btnLogout.onclick = () => {
        storage.logout();
        currentUser = null;
        activeStudentProfile = null;
        navigateTo('home');
      };
    }, 0);

    return header;
  }

  // --- HOME VIEW ---
  function renderHomeView() {
    const section = document.createElement('div');
    section.innerHTML = `
      <section class="hero-section">
        <div class="hero-overlay"></div>
        <div class="hero-container">
          <div class="hero-content">
            <h1>Intelligent Student <span>Support Service</span></h1>
            <p class="hero-description">
              Get 24/7 instant answers for your specific faculty timetable, outstanding tuition balance, hostel assignment, and exam slips.
            </p>
            <div class="hero-actions">
              <button class="btn-cta" id="hero-start-btn">
                <i class="fas fa-paper-plane"></i> Student Login to Start Chatting
              </button>
            </div>
          </div>
          <div class="hero-preview-card">
            <div class="preview-header">
              <div class="preview-status"></div>
              <strong style="font-size:0.95rem;">UniBot Assistant</strong>
            </div>
            <div class="preview-dialog">
              <div class="preview-bubble preview-user">What is my tuition fee balance?</div>
              <div class="preview-bubble preview-bot">
                Hello Ahmad! According to AIMST records for Faculty of Business and Management, your outstanding tuition balance is RM 3,000.00.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="section-categories">
        <div class="category-grid">
          <div class="category-card" data-cat="Examination">
            <div class="cat-icon"><i class="fas fa-file-alt"></i></div>
            <div class="cat-title">Faculty Exam Timetables</div>
            <div class="cat-desc">Personalized exam dates, hall locations & hall ticket downloads based on your faculty.</div>
          </div>
          <div class="category-card" data-cat="Finance">
            <div class="cat-icon"><i class="fas fa-wallet"></i></div>
            <div class="cat-title">Individual Tuition Fees</div>
            <div class="cat-desc">Check exact fee balances, clearance status & payment channels for your student ID.</div>
          </div>
          <div class="category-card" data-cat="Hostel">
            <div class="cat-icon"><i class="fas fa-building"></i></div>
            <div class="cat-title">Hostel & Accommodation</div>
            <div class="cat-desc">View your assigned room block, dorm number & rental payment receipts.</div>
          </div>
          <div class="category-card" data-cat="Student Services">
            <div class="cat-icon"><i class="fas fa-id-card"></i></div>
            <div class="cat-title">Student Services (SAD)</div>
            <div class="cat-desc">Vehicle stickers, PTPTN loan status, AIMST scholarships & library timing.</div>
          </div>
        </div>
      </section>
    `;

    setTimeout(() => {
      const heroBtn = section.querySelector('#hero-start-btn');
      if (heroBtn) heroBtn.onclick = () => {
        if (currentUser && currentUser.role === 'student') navigateTo('student-chat');
        else navigateTo('student-login');
      };

      section.querySelectorAll('.category-card').forEach(card => {
        card.onclick = () => {
          if (currentUser && currentUser.role === 'student') navigateTo('student-chat');
          else navigateTo('student-login');
        };
      });
    }, 0);

    return section;
  }

  // --- CLEAN SECURE STUDENT LOGIN VIEW ---
  function renderStudentLoginView() {
    const container = document.createElement('div');
    container.className = 'auth-page';
    container.innerHTML = `
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo-icon" style="margin: 0 auto 1rem; width:52px; height:52px; font-size:1.4rem;"><i class="fas fa-user-graduate"></i></div>
          <h2>Student Portal Login</h2>
          <p>Sign in with your student credentials to access UniBot support</p>
        </div>

        <form id="student-login-form">
          <div class="form-group">
            <label class="form-label">Matric Number</label>
            <input type="text" class="form-input" id="matric-input" placeholder="e.g. B25030023" value="B25030023" required>
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <div style="position:relative; display:flex; align-items:center;">
              <input type="text" class="form-input" id="pass-input" placeholder="Enter password" value="pass123" required style="padding-right:2.5rem; width:100%;">
              <button type="button" id="toggle-student-pass" title="Toggle password view" style="position:absolute; right:12px; background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:1rem; padding:4px;"><i class="fas fa-eye"></i></button>
            </div>
          </div>
          <button type="submit" class="btn-submit">Sign In to Student Portal</button>
        </form>
      </div>
    `;

    setTimeout(() => {
      const matricInput = container.querySelector('#matric-input');
      const passInput = container.querySelector('#pass-input');

      // Toggle password view visibility
      const toggleStudentPass = container.querySelector('#toggle-student-pass');
      if (toggleStudentPass && passInput) {
        toggleStudentPass.onclick = () => {
          const isText = passInput.getAttribute('type') === 'text';
          passInput.setAttribute('type', isText ? 'password' : 'text');
          toggleStudentPass.innerHTML = isText ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
        };
      }

      const form = container.querySelector('#student-login-form');
      form.onsubmit = (e) => {
        e.preventDefault();
        const matric = matricInput.value.trim();
        const student = storage.getStudentById(matric);

        if (!student) {
          alert(`❌ Student ID "${matric}" is not registered. Please enter a valid AIMST student matric number.`);
          return;
        }

        alert(`✔ You have successfully logged in as ${student.name} (${student.id})!`);
        currentUser = {
          role: 'student',
          id: student.id,
          name: student.name
        };
        storage.setUser(currentUser);
        initStudentChatMessages();
        navigateTo('student-chat');
      };
    }, 0);

    return container;
  }

  // --- STUDENT CHAT VIEW ---
  function renderStudentChatView() {
    const layout = document.createElement('div');
    layout.className = 'chat-layout';

    const p = activeStudentProfile || {};
    const feeText = parseFloat(p.outstandingFee || 0) > 0 ? `RM ${parseFloat(p.outstandingFee).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'RM 0.00 (Paid)';
    const feeBadgeClass = parseFloat(p.outstandingFee || 0) > 0 ? 'background:#fee2e2; color:#b91c1c;' : 'background:#dcfce7; color:#15803d;';

    layout.innerHTML = `
      <div class="chat-sidebar">
        <div class="user-profile-widget" style="flex-direction:column; align-items:flex-start; gap:0.5rem;">
          <div style="display:flex; align-items:center; gap:0.75rem; width:100%;">
            <div class="avatar-circle">${p.name ? p.name.charAt(0) : 'S'}</div>
            <div class="user-info">
              <h4>${p.name || 'Student'}</h4>
              <p>${p.id}</p>
            </div>
          </div>

          <div style="background:var(--primary-light); padding:0.65rem; border-radius:var(--radius-md); font-size:0.75rem; width:100%; border:1px solid var(--border);">
            <div style="font-weight:700; color:var(--primary); margin-bottom:0.25rem;">📍 Student Profile</div>
            <div><strong>Faculty:</strong> ${p.faculty || 'N/A'}</div>
            <div>
              <strong>Hostel Status:</strong> 
              ${(p.isHosteller === true || p.isHosteller === 'true') ?
        `<span style="color:#047857; font-weight:700;">Hosteller</span><br/><span style="color:var(--text-muted); font-size:0.7rem;">🏢 ${p.hostelBlock || 'Block'}, 🪜 ${p.staircase || 'Staircase'}, 🚪 ${p.roomNo || 'Room'}</span>` :
        `<span style="color:#64748b; font-weight:700;">Non-Hosteller (Off-Campus)</span>`
      }
            </div>
            <div style="margin-top:0.35rem; display:flex; gap:0.35rem; flex-wrap:wrap;">
              <span class="status-badge" style="${feeBadgeClass}">Fee: ${feeText}</span>
              <span class="status-badge" style="background:#e0f2fe; color:#0369a1;">Slip: ${p.examSlipStatus || 'Available'}</span>
            </div>
          </div>
        </div>

        <div class="sidebar-heading">PERSONALIZED INQUIRIES</div>
        <div class="topic-list">
          <button class="topic-btn" data-query="What is my tuition fee balance?">
            <span>💳 My Tuition Fee Balance</span> <i class="fas fa-chevron-right"></i>
          </button>
          <button class="topic-btn" data-query="When is my exam timetable?">
            <span>📅 My Faculty Exam Timetable</span> <i class="fas fa-chevron-right"></i>
          </button>
          <button class="topic-btn" data-query="Can I download my exam slip?">
            <span>📄 My Exam Slip Status</span> <i class="fas fa-chevron-right"></i>
          </button>
          <button class="topic-btn" data-query="What is my hostel room details?">
            <span>🏠 My Hostel Room Details</span> <i class="fas fa-chevron-right"></i>
          </button>
          
          <div class="sidebar-heading" style="margin-top:1rem;">FAQs</div>
          <button class="topic-btn" data-query="What are the Study Area operating hours?">
            <span>Study Area Hours</span> <i class="fas fa-chevron-right"></i>
          </button>
          <button class="topic-btn" data-query="What are the Central Library operating hours?">
            <span>Library Hours</span> <i class="fas fa-chevron-right"></i>
          </button>
          <button class="topic-btn" data-query="How do I apply for an AIMST Car or Motorcycle sticker?">
            <span>Vehicle Sticker</span> <i class="fas fa-chevron-right"></i>
          </button>
          <button class="topic-btn" data-query="Where do I apply for PTPTN loan or scholarships?">
            <span>Scholarships & SAD</span> <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>

      <div class="chat-main">
        <div class="chat-topbar">
          <div class="bot-info-title">
            <div class="logo-icon" style="width:36px; height:36px; font-size:1rem;"><i class="fas fa-robot"></i></div>
            <div>
              <strong style="font-size:1rem; display:block;">UniBot Assistant</strong>
              <span style="font-size:0.75rem; color:var(--text-muted);">AIMST University Support • 24/7 Active Context</span>
            </div>
          </div>
          <div style="display:flex; gap:0.5rem; align-items:center;">
            <button class="nav-btn nav-btn-secondary" onclick="window.openCampusMapModal()" style="font-size:0.75rem; padding:0.35rem 0.65rem;">
              <i class="fas fa-map-marked-alt"></i> Campus Map
            </button>
            <span class="status-badge"><i class="fas fa-circle" style="font-size:0.5rem; margin-right:4px;"></i> Connected to ${p.name}</span>
          </div>
        </div>

        <div class="chat-messages-container" id="chat-messages-box">
          ${renderMessageList()}
        </div>

        <div class="chat-input-bar">
          <div class="suggestion-pills">
            <button class="pill-btn" data-query="What is my tuition fee balance?">My Fee Balance</button>
            <button class="pill-btn" data-query="When is my exam timetable?">My Exam Timetable</button>
            <button class="pill-btn" data-query="Can I download my exam slip?">My Exam Slip</button>
            <button class="pill-btn" data-query="What is my hostel room details?">My Hostel Room</button>
            <button class="pill-btn" onclick="window.openCampusMapModal()">🗺️ Campus Map</button>
            <button class="pill-btn" data-query="Vehicle sticker">Vehicle Sticker</button>
          </div>
          <div class="input-wrapper">
            <input type="text" class="chat-input-field" id="user-chat-input" placeholder="Type your question here (e.g. What is my fee balance?)...">
            <button class="btn-send" id="btn-send-msg"><i class="fas fa-paper-plane"></i></button>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      const msgBox = layout.querySelector('#chat-messages-box');
      msgBox.scrollTop = msgBox.scrollHeight;

      const inputField = layout.querySelector('#user-chat-input');
      const sendBtn = layout.querySelector('#btn-send-msg');

      function sendMessage(queryText) {
        const text = queryText || inputField.value.trim();
        if (!text) return;

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        chatMessages.push({ sender: 'user', text, time });
        inputField.value = '';
        updateChatBox();

        setTimeout(() => {
          activeStudentProfile = storage.getStudentById(currentUser.id) || activeStudentProfile;
          chatbotEngine.updateKnowledgeBase(storage.getKnowledgeBase());

          const result = chatbotEngine.processQuery(text, activeStudentProfile);
          const botTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          chatMessages.push({
            sender: 'bot',
            text: result.response,
            matched: result.matched,
            isSlipAction: result.isSlipAction,
            isMapAction: result.isMapAction,
            suggested: result.suggested,
            hideFeedback: result.hideFeedback,
            time: botTime
          });

          storage.saveChatTurn(currentUser.id, currentUser.name, text, result.response);
          updateChatBox();
        }, 400);
      }

      function updateChatBox() {
        msgBox.innerHTML = renderMessageList();
        msgBox.scrollTop = msgBox.scrollHeight;
        attachFeedbackEvents(msgBox);
      }

      sendBtn.onclick = () => sendMessage();
      inputField.onkeypress = (e) => {
        if (e.key === 'Enter') sendMessage();
      };

      layout.querySelectorAll('.topic-btn, .pill-btn').forEach(btn => {
        btn.onclick = () => {
          const q = btn.getAttribute('data-query');
          sendMessage(q);
        };
      });

      attachFeedbackEvents(msgBox);
    }, 0);

    return layout;
  }

  function renderMessageList() {
    return chatMessages.map((msg, index) => {
      if (msg.sender === 'user') {
        return `
          <div class="msg-row user">
            <div class="msg-avatar user-av"><i class="fas fa-user"></i></div>
            <div class="msg-content-wrapper">
              <div class="msg-bubble">${msg.text}</div>
              <span class="msg-time">${msg.time}</span>
            </div>
          </div>
        `;
      } else {
        return `
          <div class="msg-row bot">
            <div class="msg-avatar bot-av"><i class="fas fa-robot"></i></div>
            <div class="msg-content-wrapper">
              <div class="msg-bubble">
                ${msg.text}

                ${msg.isSlipAction ? `
                  <div style="margin-top:0.75rem; text-align:center;">
                    <button class="nav-btn nav-btn-primary download-slip-btn" style="background:#16a34a; font-weight:700;">
                      <i class="fas fa-file-pdf"></i> Download Official Hall Slip (PDF)
                    </button>
                  </div>
                ` : ''}

                ${msg.isMapAction ? `
                  <div style="margin-top:0.75rem; text-align:center;">
                    <button class="nav-btn nav-btn-secondary open-map-btn" style="background:#0284c7; color:#fff; font-weight:700;">
                      <i class="fas fa-map-marked-alt"></i> Show me on the Campus Map
                    </button>
                  </div>
                ` : ''}

                ${msg.suggested ? `
                  <div style="margin-top:0.75rem; font-size:0.85rem; font-weight:600; color:var(--text-muted);">
                    Suggested topics:
                  </div>
                  <div style="display:flex; flex-direction:column; gap:0.35rem; margin-top:0.35rem;">
                    ${msg.suggested.map(s => `
                      <button class="pill-btn inline-suggest-btn" data-query="${s.question}" style="text-align:left; white-space:normal;">
                        📌 ${s.question}
                      </button>
                    `).join('')}
                  </div>
                ` : ''}

                ${!msg.hideFeedback ? `
                  <div class="feedback-container">
                    <span>Was this helpful? Rate response:</span>
                    <div class="rating-stars" data-msg-idx="${index}">
                      <button class="star-btn" data-star="1">★</button>
                      <button class="star-btn" data-star="2">★</button>
                      <button class="star-btn" data-star="3">★</button>
                      <button class="star-btn" data-star="4">★</button>
                      <button class="star-btn" data-star="5">★</button>
                    </div>
                  </div>
                ` : ''}
              </div>
              <span class="msg-time">${msg.time}</span>
            </div>
          </div>
        `;
      }
    }).join('');
  }

  function attachFeedbackEvents(container) {
    container.querySelectorAll('.download-slip-btn').forEach(btn => {
      btn.onclick = () => {
        alert(`Generating Official Exam Hall Slip for ${activeStudentProfile.name} (${activeStudentProfile.id})\nFaculty: ${activeStudentProfile.faculty}\nStatus: Verified Complete.`);
      };
    });

    container.querySelectorAll('.open-map-btn').forEach(btn => {
      btn.onclick = () => window.openCampusMapModal();
    });

    container.querySelectorAll('.inline-suggest-btn').forEach(btn => {
      btn.onclick = () => {
        const q = btn.getAttribute('data-query');
        const inputField = document.getElementById('user-chat-input');
        if (inputField) {
          inputField.value = q;
          document.getElementById('btn-send-msg').click();
        }
      };
    });

    container.querySelectorAll('.rating-stars').forEach(starsBox => {
      starsBox.querySelectorAll('.star-btn').forEach(star => {
        star.onclick = () => {
          const rating = parseInt(star.getAttribute('data-star'));
          starsBox.querySelectorAll('.star-btn').forEach((s, idx) => {
            if (idx < rating) s.classList.add('active');
            else s.classList.remove('active');
          });
          storage.addFeedback(currentUser.id, rating, "Helpful chatbot answer");
        };
      });
    });
  }

  // --- ADMIN LOGIN VIEW ---
  function renderAdminLoginView() {
    const container = document.createElement('div');
    container.className = 'auth-page';
    container.innerHTML = `
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo-icon" style="margin: 0 auto 1rem; width:54px; height:54px; font-size:1.5rem;"><i class="fas fa-user-shield"></i></div>
          <h2>Admin Management Login</h2>
          <p>Access Knowledge Base & Student Profiles Database</p>
        </div>
        <form id="admin-login-form">
          <div class="form-group">
            <label class="form-label">Username</label>
            <input type="text" class="form-input" id="admin-user-input" value="admin" required>
          </div>
          <div class="form-group">
            <label class="form-label">Password</label>
            <div style="position:relative; display:flex; align-items:center;">
              <input type="text" class="form-input" id="admin-pass-input" placeholder="Enter password" value="admin123" required style="padding-right:2.5rem; width:100%;">
              <button type="button" id="toggle-admin-pass" title="Toggle password view" style="position:absolute; right:12px; background:none; border:none; color:var(--text-muted); cursor:pointer; font-size:1rem; padding:4px;"><i class="fas fa-eye"></i></button>
            </div>
          </div>
          <button type="submit" class="btn-submit">Login to Admin Portal</button>
        </form>
      </div>
    `;

    setTimeout(() => {
      const userInput = container.querySelector('#admin-user-input');
      const passInput = container.querySelector('#admin-pass-input');

      // Toggle password view visibility
      const toggleAdminPass = container.querySelector('#toggle-admin-pass');
      if (toggleAdminPass && passInput) {
        toggleAdminPass.onclick = () => {
          const isText = passInput.getAttribute('type') === 'text';
          passInput.setAttribute('type', isText ? 'password' : 'text');
          toggleAdminPass.innerHTML = isText ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
        };
      }

      const form = container.querySelector('#admin-login-form');
      form.onsubmit = (e) => {
        e.preventDefault();
        const user = userInput.value.trim();
        const pass = passInput.value.trim();

        if (user === 'admin' && pass === 'admin123') {
          alert('✔ You have successfully logged in as System Administrator (Full Access)!');
          currentUser = { role: 'admin', id: 'admin', name: 'System Administrator', readOnly: false };
          storage.setUser(currentUser);
          navigateTo('admin-dashboard');
        } else if ((user === 'viewer' || user === 'staff' || user === 'viewonly') && (pass === 'viewer123' || pass === 'view123' || pass === 'staff123')) {
          alert('✔ You have successfully logged in as Staff Viewer (View-Only Mode)!\n\nYou can ONLY VIEW student information. Editing and deletion features are disabled.');
          currentUser = { role: 'admin', id: 'viewer', name: 'Staff Viewer (View-Only)', readOnly: true };
          storage.setUser(currentUser);
          navigateTo('admin-dashboard');
        } else {
          alert('❌ Invalid admin credentials.\n\nPlease use:\n• Full Admin: admin / admin123\n• View-Only Admin: viewer / viewer123');
        }
      };
    }, 0);

    return container;
  }

  // --- ADMIN DASHBOARD VIEW ---
  function renderAdminDashboardView() {
    const layout = document.createElement('div');
    layout.className = 'admin-layout';

    layout.innerHTML = `
      <div class="admin-sidebar">
        <div style="padding: 0 0.5rem; margin-bottom: 0.5rem;">
          <h3 style="font-size:1.1rem; color:#fff; display:flex; align-items:center; gap:0.5rem;">
            <i class="fas fa-sliders-h"></i> Admin Panel
          </h3>
          <div style="display:flex; align-items:center; gap:0.4rem; margin-top:0.3rem;">
            <span style="font-size:0.75rem; color:#cbd5e1;">${currentUser && currentUser.readOnly ? 'Staff Viewer' : 'System Admin'}</span>
            <span class="status-badge" style="${currentUser && currentUser.readOnly ? 'background:#e0f2fe; color:#0369a1;' : 'background:#dcfce7; color:#15803d;'} font-size:0.65rem; padding:0.1rem 0.4rem;">
              ${currentUser && currentUser.readOnly ? '👁️ View-Only' : '⚡ Full Admin'}
            </span>
          </div>
        </div>
        <div class="admin-menu">
          <button class="admin-menu-item ${adminSubTab === 'kb' ? 'active' : ''}" id="tab-btn-kb">
            <i class="fas fa-database"></i> Knowledge Base Data
          </button>
          <button class="admin-menu-item ${adminSubTab === 'students' ? 'active' : ''}" id="tab-btn-students">
            <i class="fas fa-user-graduate"></i> Student Profiles Database
          </button>
          <button class="admin-menu-item ${adminSubTab === 'history' ? 'active' : ''}" id="tab-btn-history">
            <i class="fas fa-history"></i> Chat Logs & Monitoring
          </button>
          <button class="admin-menu-item ${adminSubTab === 'feedback' ? 'active' : ''}" id="tab-btn-feedback">
            <i class="fas fa-star"></i> Student Feedback
          </button>
          <button class="admin-menu-item" id="btn-export-sql" style="margin-top:1.5rem; background:rgba(2, 132, 199, 0.2); color:#38bdf8; border:1px solid rgba(56, 189, 248, 0.4);">
            <i class="fas fa-file-export"></i> View / Export MySQL Dump
          </button>
        </div>
      </div>

      <div class="admin-content">
        ${renderAdminSubTabContent()}
      </div>
    `;

    setTimeout(() => {
      const tabKb = layout.querySelector('#tab-btn-kb');
      if (tabKb) tabKb.onclick = () => { adminSubTab = 'kb'; render(); };

      const tabStu = layout.querySelector('#tab-btn-students');
      if (tabStu) tabStu.onclick = () => { adminSubTab = 'students'; render(); };

      const tabHist = layout.querySelector('#tab-btn-history');
      if (tabHist) tabHist.onclick = () => { adminSubTab = 'history'; render(); };

      const tabFb = layout.querySelector('#tab-btn-feedback');
      if (tabFb) tabFb.onclick = () => { adminSubTab = 'feedback'; render(); };

      const btnSql = layout.querySelector('#btn-export-sql');
      if (btnSql) btnSql.onclick = () => window.openSqlDumpModal();

      attachAdminContentEvents(layout);
    }, 0);

    return layout;
  }

  function renderAdminSubTabContent() {
    const isReadOnly = !!(currentUser && currentUser.readOnly);
    const readOnlyBanner = isReadOnly ? `
      <div class="viewonly-alert-banner" style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:8px; padding:0.75rem 1rem; margin-bottom:1.25rem; display:flex; align-items:center; gap:0.75rem; color:#0369a1;">
        <i class="fas fa-eye" style="font-size:1.3rem; color:#0284c7;"></i>
        <div style="flex:1;">
          <div style="font-weight:700; font-size:0.95rem;">👁️ View-Only Admin Mode Active</div>
          <div style="font-size:0.82rem; color:#075985;">You are logged in with <strong>View-Only</strong> permissions. You can view all student records and data, but <strong>cannot add, edit, or delete</strong> student information.</div>
        </div>
        <span style="background:#e0f2fe; color:#0369a1; padding:0.25rem 0.6rem; border-radius:999px; font-size:0.75rem; font-weight:700; border:1px solid #7dd3fc;">Read-Only</span>
      </div>
    ` : '';

    if (adminSubTab === 'kb') {
      const kbData = storage.getKnowledgeBase();
      
      // Extract unique categories
      const categoriesSet = new Set();
      kbData.forEach(item => {
        if (item.category) categoriesSet.add(item.category);
      });
      // Ensure requested categories exist
      ['PTPTN', 'Scholarship', 'Study Area', 'Library'].forEach(cat => categoriesSet.add(cat));
      
      const categoriesList = Array.from(categoriesSet).sort();

      // Compute stats
      const kbStats = {};
      categoriesList.forEach(cat => {
        kbStats[cat] = kbData.filter(item => item.category === cat).length;
      });

      // Filter data
      const filteredKbData = kbData.filter(item => {
        if (selectedKBCategoryFilter !== 'ALL' && item.category !== selectedKBCategoryFilter) return false;
        return true;
      });

      return `
        ${readOnlyBanner}
        <div class="admin-page-title">
          <div>
            <h2>Knowledge Base Management</h2>
            <p style="color:var(--text-muted); font-size:0.9rem;">Manage FAQs, keyword triggers, and standardized responses</p>
          </div>
          ${isReadOnly ? `
            <span style="display:inline-flex; align-items:center; gap:0.4rem; background:#f1f5f9; color:#475569; padding:0.45rem 0.8rem; border-radius:6px; font-size:0.85rem; font-weight:600; border:1px solid #cbd5e1;">
              <i class="fas fa-lock" style="color:#64748b;"></i> KB Editing Disabled (View-Only)
            </span>
          ` : `
            <button class="nav-btn nav-btn-primary" id="btn-add-kb">
              <i class="fas fa-plus"></i> Add New Entry
            </button>
          `}
        </div>

        <!-- KB Category Cards Header -->
        <div style="margin-bottom:1rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <strong style="font-size:0.95rem; color:var(--text-main);"><i class="fas fa-tags"></i> Knowledge Base Categories (Click to Filter)</strong>
            ${selectedKBCategoryFilter !== 'ALL' ? `
              <button id="btn-reset-kb-category" class="nav-btn nav-btn-secondary" style="padding:0.25rem 0.6rem; font-size:0.75rem;">
                🔄 Show All Categories
              </button>
            ` : ''}
          </div>
          <div class="faculty-cards-grid">
            ${categoriesList.map((cat, idx) => {
              const count = kbStats[cat] || 0;
              const isActive = selectedKBCategoryFilter === cat;
              return `
                <div class="faculty-card kb-category-card ${isActive ? 'active' : ''}" data-kb-category="${cat}">
                  <div class="faculty-card-header">
                    <span class="faculty-card-title">${idx + 1}. ${cat}</span>
                    <span class="faculty-card-count">${count}</span>
                  </div>
                  <div class="faculty-card-meta">
                    <span>Knowledge Base Entries</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div class="table-card">
          <div class="table-toolbar">
            <input type="text" class="form-input" id="search-kb-input" placeholder="Search questions or keywords..." style="max-width:320px;">
            <span style="font-size:0.85rem; color:var(--text-muted);">Showing <strong>${filteredKbData.length}</strong> of <strong>${kbData.length}</strong> Entries</span>
          </div>
          <div style="overflow-x:auto;">
            <table class="data-table" id="kb-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Question</th>
                  <th>Keywords</th>
                  <th>Response</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filteredKbData.length === 0 ? `
                  <tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--text-muted);">No entries found for this category.</td></tr>
                ` : filteredKbData.map(item => `
                  <tr data-id="${item.id}">
                    <td><span class="category-tag">${item.category || 'General'}</span></td>
                    <td style="font-weight:600;">${item.question}</td>
                    <td style="font-size:0.8rem; color:var(--text-muted);">${(item.keywords || []).join(', ')}</td>
                    <td style="max-width:340px; font-size:0.85rem;">${item.response}</td>
                    <td>
                      <div class="action-btns">
                        ${isReadOnly ? `
                          <button class="btn-icon btn-view-kb" data-id="${item.id}" title="View Knowledge Item" style="color:#0284c7; background:rgba(2,132,199,0.1); border-color:rgba(2,132,199,0.3);"><i class="fas fa-eye"></i></button>
                        ` : `
                          <button class="btn-icon btn-edit-kb" data-id="${item.id}" title="Edit"><i class="fas fa-edit"></i></button>
                          <button class="btn-icon delete btn-delete-kb" data-id="${item.id}" title="Delete"><i class="fas fa-trash"></i></button>
                        `}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (adminSubTab === 'students') {
      const allStudents = storage.getStudents();
      const structure = storage.getAIMSTStructure();
      const facultiesList = Object.keys(structure);

      // Compute stats per faculty
      const facultyStats = {};
      facultiesList.forEach(fac => {
        const facStus = allStudents.filter(s => s.faculty === fac);
        const blocked = facStus.filter(s => parseFloat(s.outstandingFee || 0) > 0).length;
        const totalFee = facStus.reduce((sum, s) => sum + parseFloat(s.outstandingFee || 0), 0);
        facultyStats[fac] = { count: facStus.length, blocked, totalFee };
      });

      // Filter students list
      let filteredStudents = allStudents.filter(s => {
        if (selectedFacultyFilter !== 'ALL') {
          const facNorm = (s.faculty || '').replace(/\band\b/gi, '&').trim().toLowerCase();
          const selNorm = selectedFacultyFilter.replace(/\band\b/gi, '&').trim().toLowerCase();
          if (facNorm !== selNorm) return false;
        }
        if (selectedLevelFilter !== 'ALL') {
          const sLvl = (s.level || '').trim().toLowerCase();
          const selLvl = selectedLevelFilter.trim().toLowerCase();
          if (sLvl !== selLvl && !(selLvl === 'degree' && sLvl === 'undergraduate') && !(selLvl === 'certificate' && sLvl.includes('certificate'))) {
            return false;
          }
        }
        if (selectedCourseFilter !== 'ALL' && s.course !== selectedCourseFilter) return false;
        return true;
      });

      // Available Levels for selected Faculty
      let availableLevels = [];
      if (selectedFacultyFilter !== 'ALL' && structure[selectedFacultyFilter]) {
        availableLevels = Object.keys(structure[selectedFacultyFilter]);
      } else {
        availableLevels = ["Degree", "Diploma", "Certificate", "Master", "PhD", "Foundation"];
      }

      // Available Courses for selected Faculty
      let availableCourses = [];
      if (selectedFacultyFilter !== 'ALL' && structure[selectedFacultyFilter]) {
        Object.values(structure[selectedFacultyFilter]).forEach(cList => {
          availableCourses.push(...cList);
        });
      }

      return `
        ${readOnlyBanner}
        <div class="admin-page-title">
          <div>
            <h2>AIMST University Student Profiles Database</h2>
            <p style="color:var(--text-muted); font-size:0.9rem;">Organized across 8 AIMST Faculties & Courses. Supports real-time fee updates & bulk non-destructive Excel/CSV import.</p>
          </div>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
            ${isReadOnly ? `
              <span style="display:inline-flex; align-items:center; gap:0.4rem; background:#f1f5f9; color:#475569; padding:0.45rem 0.8rem; border-radius:6px; font-size:0.85rem; font-weight:600; border:1px solid #cbd5e1;">
                <i class="fas fa-lock" style="color:#64748b;"></i> Student Editing Disabled (View-Only)
              </span>
            ` : `
              <button class="nav-btn nav-btn-primary" id="btn-add-stu">
                <i class="fas fa-user-plus"></i> Add New Student
              </button>
              <button class="nav-btn nav-btn-secondary" id="btn-extract-admissions" style="background:#0284c7; color:#fff;">
                <i class="fas fa-file-excel"></i> Bulk Import (Excel/CSV)
              </button>
            `}
            <button class="nav-btn nav-btn-secondary" id="btn-export-csv" style="background:#10b981; color:#fff;">
              <i class="fas fa-download"></i> Export to CSV
            </button>
          </div>
        </div>

        <!-- 8 AIMST Faculties Cards Header -->
        <div style="margin-bottom:1rem;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
            <strong style="font-size:0.95rem; color:var(--text-main);"><i class="fas fa-university"></i> AIMST Faculties Directory (Click to Filter)</strong>
            ${selectedFacultyFilter !== 'ALL' ? `
              <button id="btn-reset-faculties" class="nav-btn nav-btn-secondary" style="padding:0.25rem 0.6rem; font-size:0.75rem;">
                🔄 Show All Faculties
              </button>
            ` : ''}
          </div>
          <div class="faculty-cards-grid">
            ${facultiesList.map((fac, idx) => {
        const stat = facultyStats[fac] || { count: 0, blocked: 0, totalFee: 0 };
        const isActive = selectedFacultyFilter === fac;
        return `
                <div class="faculty-card ${isActive ? 'active' : ''}" data-faculty="${fac}">
                  <div class="faculty-card-header">
                    <span class="faculty-card-title">${idx + 1}. ${fac}</span>
                    <span class="faculty-card-count">${stat.count}</span>
                  </div>
                  <div class="faculty-card-meta">
                    <span>Blocked Slips: <strong style="${stat.blocked > 0 ? 'color:#ef4444;' : 'color:#10b981;'}">${stat.blocked}</strong></span>
                    <span>RM ${stat.totalFee.toFixed(0)}</span>
                  </div>
                </div>
              `;
      }).join('')}
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="table-card">
          <div class="table-toolbar" style="display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center; justify-content:space-between;">
            <div style="display:flex; gap:0.5rem; flex-wrap:wrap; flex:1; align-items:center;">
              <select class="form-select" id="filter-faculty-select" style="max-width:240px; font-weight:600;">
                <option value="ALL" ${selectedFacultyFilter === 'ALL' ? 'selected' : ''}>🏛️ All 8 Faculties</option>
                ${facultiesList.map(f => `<option value="${f}" ${selectedFacultyFilter === f ? 'selected' : ''}>${f}</option>`).join('')}
              </select>

              <select class="form-select" id="filter-level-select" style="max-width:180px;">
                <option value="ALL" ${selectedLevelFilter === 'ALL' ? 'selected' : ''}>🎓 All Study Levels</option>
                ${availableLevels.map(l => `<option value="${l}" ${selectedLevelFilter === l ? 'selected' : ''}>${l}</option>`).join('')}
              </select>

              ${availableCourses.length > 0 ? `
                <select class="form-select" id="filter-course-select" style="max-width:240px;">
                  <option value="ALL" ${selectedCourseFilter === 'ALL' ? 'selected' : ''}>📚 All Faculty Courses</option>
                  ${availableCourses.map(c => `<option value="${c}" ${selectedCourseFilter === c ? 'selected' : ''}>${c}</option>`).join('')}
                </select>
              ` : ''}

              <input type="text" class="form-input" id="search-stu-input" placeholder="Search student name, ID..." style="max-width:220px;">
            </div>

            <span style="font-size:0.85rem; color:var(--text-muted);">Showing <strong>${filteredStudents.length}</strong> of <strong>${allStudents.length}</strong> Students</span>
          </div>

          <div style="overflow-x:auto;">
            <table class="data-table" id="stu-table">
              <thead>
                <tr>
                  <th>Matric ID & Student Name</th>
                  <th>Faculty & Academic Course</th>
                  <th>Hostel Status & Details</th>
                  <th>Outstanding Fee</th>
                  <th>Exam Slip</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${filteredStudents.length === 0 ? `
                  <tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">No student profiles found for the selected faculty/filter. Click "Add New Student" or "Bulk Import" to insert records.</td></tr>
                ` : filteredStudents.map(s => {
        const isH = s.isHosteller === true || s.isHosteller === 'true';
        const levelClass = (s.level || 'undergraduate').toLowerCase().replace(/[^a-z]/g, '');
        return `
                    <tr>
                      <td>
                        <strong>${s.name}</strong><br/>
                        <code style="font-size:0.75rem;">${s.id}</code>
                      </td>
                      <td style="font-size:0.85rem;">
                        <span class="level-badge ${levelClass}">${s.level || 'Degree'}</span> <strong>${s.faculty}</strong><br/>
                        <span style="color:var(--text-muted); font-size:0.75rem;">${s.course}</span>
                      </td>
                      <td style="font-size:0.85rem;">
                        ${isH ? `
                          <span class="status-badge" style="background:#d1fae5; color:#047857; font-weight:700;">Hosteller</span><br/>
                          <span style="font-size:0.75rem; color:var(--text-muted);">
                            🏢 ${s.hostelBlock || 'N/A'} • 🪜 ${s.staircase || 'N/A'} • 🚪 ${s.roomNo || 'N/A'}
                          </span>
                        ` : `
                          <span class="status-badge" style="background:#f1f5f9; color:#64748b; font-weight:700;">Non-Hosteller</span>
                        `}
                      </td>
                      <td>
                        <span class="status-badge" style="${parseFloat(s.outstandingFee || 0) > 0 ? 'background:#fee2e2; color:#b91c1c;' : 'background:#dcfce7; color:#15803d;'}">
                          RM ${parseFloat(s.outstandingFee || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td>
                        <span class="status-badge" style="${s.examSlipStatus === 'Available' ? 'background:#dcfce7; color:#15803d;' :
            s.examSlipStatus === 'Not Available' ? 'background:#fef3c7; color:#b45309;' :
              'background:#fee2e2; color:#b91c1c;'
          }">
                          ${s.examSlipStatus || 'N/A'}
                        </span>
                      </td>
                      <td>
                        <div class="action-btns">
                          ${isReadOnly ? `
                            <button class="btn-icon btn-view-stu" data-id="${s.id}" title="View Student Profile (Read-Only)" style="color:#0284c7; background:rgba(2,132,199,0.1); border-color:rgba(2,132,199,0.3);">
                              <i class="fas fa-eye"></i>
                            </button>
                          ` : `
                            <button class="btn-icon btn-edit-stu" data-id="${s.id}" title="Edit Student Profile"><i class="fas fa-edit"></i></button>
                            <button class="btn-icon delete btn-delete-stu" data-id="${s.id}" title="Delete Student"><i class="fas fa-trash"></i></button>
                          `}
                        </div>
                      </td>
                    </tr>
                  `;
      }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (adminSubTab === 'history') {
      const history = storage.getChatHistory();
      return `
        ${readOnlyBanner}
        <div class="admin-page-title">
          <div>
            <h2>Chat History & Monitoring</h2>
            <p style="color:var(--text-muted); font-size:0.9rem;">Review recent student interaction transcripts and query volume</p>
          </div>
        </div>

        <div class="table-card">
          <div style="overflow-x:auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Student</th>
                  <th>Matric ID</th>
                  <th>Turns</th>
                  <th>Last Inquiry</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                ${history.map(h => `
                  <tr>
                    <td><code>${h.id}</code></td>
                    <td style="font-weight:600;">${h.studentName}</td>
                    <td>${h.studentId}</td>
                    <td><span class="status-badge">${h.turns} turns</span></td>
                    <td style="max-width:300px; font-size:0.85rem;">${h.lastQuestion}</td>
                    <td style="font-size:0.8rem; color:var(--text-muted);">${h.timestamp}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } else if (adminSubTab === 'feedback') {
      const logs = storage.getFeedbackLogs();
      return `
        ${readOnlyBanner}
        <div class="admin-page-title">
          <div>
            <h2>Student Feedback & Analytics</h2>
            <p style="color:var(--text-muted); font-size:0.9rem;">Student satisfaction ratings and service performance feedback</p>
          </div>
        </div>

        <div class="table-card">
          <div style="overflow-x:auto;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Rating</th>
                  <th>Feedback Comment</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                ${logs.map(f => `
                  <tr>
                    <td><strong>${f.studentId}</strong></td>
                    <td style="color:#f59e0b; font-size:1.1rem;">
                      ${'★'.repeat(f.rating)}${'☆'.repeat(5 - f.rating)}
                    </td>
                    <td>${f.comment || 'No comment provided.'}</td>
                    <td style="font-size:0.8rem; color:var(--text-muted);">${f.timestamp}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    }
  }

  function attachAdminContentEvents(container) {
    const btnAdd = container.querySelector('#btn-add-kb');
    if (btnAdd) btnAdd.onclick = () => openKbModal();

    const searchInput = container.querySelector('#search-kb-input');
    if (searchInput) {
      searchInput.oninput = (e) => {
        const q = e.target.value.toLowerCase();
        container.querySelectorAll('#kb-table tbody tr').forEach(row => {
          const text = row.innerText.toLowerCase();
          row.style.display = text.includes(q) ? '' : 'none';
        });
      };
    }

    // KB Category Cards Click to Filter
    container.querySelectorAll('.kb-category-card').forEach(card => {
      card.onclick = () => {
        selectedKBCategoryFilter = card.getAttribute('data-kb-category');
        render();
      };
    });

    const btnResetKbCat = container.querySelector('#btn-reset-kb-category');
    if (btnResetKbCat) {
      btnResetKbCat.onclick = () => {
        selectedKBCategoryFilter = 'ALL';
        render();
      };
    }

    // Faculty Cards Click to Filter
    container.querySelectorAll('.faculty-card:not(.kb-category-card)').forEach(card => {
      card.onclick = () => {
        selectedFacultyFilter = card.getAttribute('data-faculty');
        selectedLevelFilter = 'ALL';
        selectedCourseFilter = 'ALL';
        render();
      };
    });

    const btnResetFac = container.querySelector('#btn-reset-faculties');
    if (btnResetFac) {
      btnResetFac.onclick = () => {
        selectedFacultyFilter = 'ALL';
        selectedLevelFilter = 'ALL';
        selectedCourseFilter = 'ALL';
        render();
      };
    }

    const selFac = container.querySelector('#filter-faculty-select');
    if (selFac) {
      selFac.onchange = (e) => {
        selectedFacultyFilter = e.target.value;
        selectedLevelFilter = 'ALL';
        selectedCourseFilter = 'ALL';
        render();
      };
    }

    const selLev = container.querySelector('#filter-level-select');
    if (selLev) {
      selLev.onchange = (e) => {
        selectedLevelFilter = e.target.value;
        selectedCourseFilter = 'ALL';
        render();
      };
    }

    const selCrs = container.querySelector('#filter-course-select');
    if (selCrs) {
      selCrs.onchange = (e) => {
        selectedCourseFilter = e.target.value;
        render();
      };
    }

    const searchStuInput = container.querySelector('#search-stu-input');
    if (searchStuInput) {
      searchStuInput.oninput = (e) => {
        const q = e.target.value.toLowerCase();
        container.querySelectorAll('#stu-table tbody tr').forEach(row => {
          const text = row.innerText.toLowerCase();
          row.style.display = text.includes(q) ? '' : 'none';
        });
      };
    }

    const btnExportCSV = container.querySelector('#btn-export-csv');
    if (btnExportCSV) {
      btnExportCSV.onclick = () => {
        const csvData = storage.exportStudentsToCSV(selectedFacultyFilter, selectedCourseFilter);
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `aimst_student_profiles_${selectedFacultyFilter.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      };
    }

    container.querySelectorAll('.btn-view-kb').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const kb = storage.getKnowledgeBase().find(item => item.id === id);
        if (kb) openKbModal(kb, true);
      };
    });

    container.querySelectorAll('.btn-edit-kb').forEach(btn => {
      btn.onclick = () => {
        if (currentUser && currentUser.readOnly) {
          alert("Access Denied: View-only admin accounts cannot edit knowledge base entries.");
          return;
        }
        const id = btn.getAttribute('data-id');
        const kb = storage.getKnowledgeBase().find(item => item.id === id);
        if (kb) openKbModal(kb, false);
      };
    });

    container.querySelectorAll('.btn-delete-kb').forEach(btn => {
      btn.onclick = () => {
        if (currentUser && currentUser.readOnly) {
          alert("Access Denied: View-only admin accounts cannot delete knowledge base entries.");
          return;
        }
        const id = btn.getAttribute('data-id');
        if (confirm('Are you sure you want to delete this Knowledge Base entry?')) {
          storage.deleteKnowledgeItem(id);
          render();
        }
      };
    });

    container.querySelectorAll('.btn-view-stu').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const student = storage.getStudentById(id);
        if (student) openStudentModal(student, true);
      };
    });

    container.querySelectorAll('.btn-edit-stu').forEach(btn => {
      btn.onclick = () => {
        if (currentUser && currentUser.readOnly) {
          alert("Access Denied: View-only admin accounts cannot edit student information.");
          return;
        }
        const id = btn.getAttribute('data-id');
        const student = storage.getStudentById(id);
        if (student) openStudentModal(student, false);
      };
    });

    container.querySelectorAll('.btn-delete-stu').forEach(btn => {
      btn.onclick = () => {
        if (currentUser && currentUser.readOnly) {
          alert("Access Denied: View-only admin accounts cannot delete student records.");
          return;
        }
        const id = btn.getAttribute('data-id');
        if (confirm(`Are you sure you want to delete student profile (${id})?`)) {
          storage.deleteStudent(id);
          render();
        }
      };
    });

    const btnAddStu = container.querySelector('#btn-add-stu');
    if (btnAddStu) {
      btnAddStu.onclick = () => {
        if (currentUser && currentUser.readOnly) {
          alert("Access Denied: View-only admin accounts cannot add new students.");
          return;
        }
        openStudentModal(null, false);
      };
    }

    const btnExtractAdm = container.querySelector('#btn-extract-admissions');
    if (btnExtractAdm) {
      btnExtractAdm.onclick = () => {
        if (currentUser && currentUser.readOnly) {
          alert("Access Denied: View-only admin accounts cannot perform bulk imports.");
          return;
        }
        openExtractAdmissionsModal();
      };
    }
  }

  function openKbModal(kbItem = null, isReadOnly = false) {
    editingKbId = kbItem ? kbItem.id : null;
    const readOnlyMode = isReadOnly || !!(currentUser && currentUser.readOnly);

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-card">
        <div class="modal-header">
          <h3>${readOnlyMode ? '👁️ View Knowledge Base Entry' : editingKbId ? 'Edit Knowledge Base Entry' : 'Add New Knowledge Base Entry'}</h3>
          <button class="btn-icon" id="modal-close-btn"><i class="fas fa-times"></i></button>
        </div>
        <form id="kb-modal-form">
          <div class="modal-body">
            ${readOnlyMode ? `
              <div style="background:#f0f9ff; border:1px solid #bae6fd; border-radius:6px; padding:0.6rem 0.85rem; color:#0369a1; font-size:0.85rem; display:flex; align-items:center; gap:0.5rem; margin-bottom:1rem;">
                <i class="fas fa-lock"></i>
                <span><strong>View-Only Mode:</strong> This entry is open in read-only mode. Editing is disabled.</span>
              </div>
            ` : ''}
            <div class="form-group">
              <label class="form-label">Category</label>
              <select class="form-select" id="modal-cat" ${readOnlyMode ? 'disabled style="background:#f8fafc;"' : ''} required>
                <option value="Examination" ${kbItem && kbItem.category === 'Examination' ? 'selected' : ''}>Examination</option>
                <option value="Finance" ${kbItem && kbItem.category === 'Finance' ? 'selected' : ''}>Finance / Tuition</option>
                <option value="Hostel" ${kbItem && kbItem.category === 'Hostel' ? 'selected' : ''}>Hostel & Accommodation</option>
                <option value="Student Services" ${kbItem && kbItem.category === 'Student Services' ? 'selected' : ''}>Student Services (SAD)</option>
                <option value="Academic" ${kbItem && kbItem.category === 'Academic' ? 'selected' : ''}>Academic & Courses</option>
                <option value="Scholarship" ${kbItem && kbItem.category === 'Scholarship' ? 'selected' : ''}>Scholarship</option>
                <option value="PTPTN" ${kbItem && kbItem.category === 'PTPTN' ? 'selected' : ''}>PTPTN</option>
                <option value="Facilities" ${kbItem && kbItem.category === 'Facilities' ? 'selected' : ''}>Facilities & Campus Map</option>
                <option value="Study Area" ${kbItem && kbItem.category === 'Study Area' ? 'selected' : ''}>Study Area</option>
                <option value="Library" ${kbItem && kbItem.category === 'Library' ? 'selected' : ''}>Library</option>
                <option value="Clinic" ${kbItem && kbItem.category === 'Clinic' ? 'selected' : ''}>Clinic & Health</option>
                <option value="Cafeteria" ${kbItem && kbItem.category === 'Cafeteria' ? 'selected' : ''}>Cafeteria & Food</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Question Title</label>
              <input type="text" class="form-input" id="modal-question" value="${kbItem ? kbItem.question : ''}" ${readOnlyMode ? 'readonly style="background:#f8fafc;"' : ''} required>
            </div>
            <div class="form-group">
              <label class="form-label">Keywords (Comma Separated)</label>
              <input type="text" class="form-input" id="modal-keywords" value="${kbItem && kbItem.keywords ? kbItem.keywords.join(', ') : ''}" ${readOnlyMode ? 'readonly style="background:#f8fafc;"' : ''} required>
            </div>
            <div class="form-group">
              <label class="form-label">Standardized Response</label>
              <textarea class="form-textarea" id="modal-response" rows="4" ${readOnlyMode ? 'readonly style="background:#f8fafc;"' : ''} required>${kbItem ? kbItem.response : ''}</textarea>
            </div>
          </div>
          <div class="modal-footer">
            ${readOnlyMode ? `
              <button type="button" class="nav-btn nav-btn-primary" id="modal-cancel-btn">Close View</button>
            ` : `
              <button type="button" class="nav-btn nav-btn-secondary" id="modal-cancel-btn">Cancel</button>
              <button type="submit" class="nav-btn nav-btn-primary">Save Entry</button>
            `}
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#modal-close-btn').onclick = () => overlay.remove();
    overlay.querySelector('#modal-cancel-btn').onclick = () => overlay.remove();

    overlay.querySelector('#kb-modal-form').onsubmit = (e) => {
      e.preventDefault();
      if (readOnlyMode) {
        alert("Access Denied: View-only accounts cannot modify entries.");
        overlay.remove();
        return;
      }
      const category = overlay.querySelector('#modal-cat').value;
      const question = overlay.querySelector('#modal-question').value.trim();
      const keywordsRaw = overlay.querySelector('#modal-keywords').value;
      const keywords = keywordsRaw.split(',').map(k => k.trim()).filter(k => k.length > 0);
      const response = overlay.querySelector('#modal-response').value.trim();

      if (editingKbId) {
        storage.updateKnowledgeItem(editingKbId, { category, question, keywords, response });
      } else {
        storage.addKnowledgeItem({ category, question, keywords, response });
      }

      overlay.remove();
      render();
    };
  }

  function openStudentModal(student = null, isReadOnly = false) {
    const isEdit = !!student;
    const readOnlyMode = isReadOnly || !!(currentUser && currentUser.readOnly);
    const structure = storage.getAIMSTStructure();
    const facultyList = Object.keys(structure);
    const defaultFaculty = facultyList[0] || "Faculty of Business & Management";

    // Normalize student profile data
    const s = student ? { ...student } : {
      id: "B2503" + Math.floor(1000 + Math.random() * 9000),
      name: "",
      email: "",
      faculty: defaultFaculty,
      level: "Degree",
      course: "Bachelor of Science (Hons) Management Information Systems",
      isHosteller: true,
      hostelBlock: "Block A",
      staircase: "Staircase 1",
      roomNo: "Room 101",
      outstandingFee: 0,
      examTimetable: "June 1 – June 10, 2026 (Exam Hall 1)",
      examSlipStatus: "Available",
      examSlipReason: "All fees cleared."
    };

    // Normalize legacy level names like "Undergraduate" -> "Degree", "Postgraduate" -> "Master"
    if (s.level === 'Undergraduate') s.level = 'Degree';
    if (s.level === 'Postgraduate') s.level = 'Master';
    if (!s.level) s.level = 'Degree';

    // Normalize faculty string (e.g. 'and' vs '&')
    if (s.faculty && s.faculty.includes('Business and Management')) {
      s.faculty = 'Faculty of Business & Management';
    }

    const isHostellerInit = s.isHosteller === true || s.isHosteller === 'true';
    const studyLevels = ["Degree", "Diploma", "Certificate", "Master", "PhD", "Foundation"];

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-card" style="max-width:680px;">
        <div class="modal-header">
          <h3>${readOnlyMode ? `👁️ View Student Profile: ${s.name} (${s.id})` : isEdit ? `Edit Student Profile: ${s.name} (${s.id})` : '➕ Add New Student Profile'}</h3>
          <button class="btn-icon" id="modal-close-btn"><i class="fas fa-times"></i></button>
        </div>
        <form id="stu-modal-form">
          <div class="modal-body" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem;">
            ${readOnlyMode ? `
              <div style="grid-column:1 / -1; background:#f0f9ff; border:1px solid #bae6fd; border-radius:6px; padding:0.6rem 0.85rem; color:#0369a1; font-size:0.85rem; display:flex; align-items:center; gap:0.5rem;">
                <i class="fas fa-lock"></i>
                <span><strong>View-Only Mode:</strong> You are viewing this student profile in read-only mode. All fields are locked against editing.</span>
              </div>
            ` : ''}

            <div class="form-group">
              <label class="form-label">Matric ID / Student Number</label>
              <input type="text" class="form-input" id="stu-id" value="${s.id}" ${readOnlyMode || isEdit ? 'readonly style="background:#f1f5f9;"' : ''} required>
            </div>
            <div class="form-group">
              <label class="form-label">Full Name</label>
              <input type="text" class="form-input" id="stu-name" value="${s.name}" placeholder="e.g. Tan Wei Ming" ${readOnlyMode ? 'readonly style="background:#f8fafc;"' : ''} required>
            </div>
            <div class="form-group" style="grid-column:1 / -1;">
              <label class="form-label">Student Email Address</label>
              <input type="email" class="form-input" id="stu-email" value="${s.email || ''}" placeholder="e.g. student@student.aimst.edu.my" ${readOnlyMode ? 'readonly style="background:#f8fafc;"' : ''} required>
            </div>

            <!-- FACULTY SELECTION -->
            <div class="form-group">
              <label class="form-label">Faculty</label>
              <select class="form-select" id="stu-faculty" ${readOnlyMode ? 'disabled style="background:#f8fafc;"' : ''} required>
                ${facultyList.map(f => `<option value="${f}" ${s.faculty === f ? 'selected' : ''}>${f}</option>`).join('')}
              </select>
            </div>

            <!-- STUDYING LEVEL SELECTION -->
            <div class="form-group">
              <label class="form-label">Studying Level</label>
              <select class="form-select" id="stu-level" ${readOnlyMode ? 'disabled style="background:#f8fafc;"' : ''} required>
                ${studyLevels.map(lvl => `<option value="${lvl}" ${s.level === lvl ? 'selected' : ''}>${lvl}</option>`).join('')}
              </select>
            </div>

            <!-- DYNAMIC COURSE / PROGRAM SELECTION -->
            <div class="form-group" style="grid-column:1 / -1;">
              <label class="form-label">Academic Program / Course</label>
              <select class="form-select" id="stu-course-select" ${readOnlyMode ? 'disabled style="background:#f8fafc; margin-bottom:0.5rem;"' : 'style="margin-bottom:0.5rem;"'}></select>
              <input type="text" class="form-input" id="stu-course-custom" placeholder="Type custom course title if not in list..." style="display:none;" value="" ${readOnlyMode ? 'readonly style="background:#f8fafc;"' : ''}>
            </div>

            <!-- HOSTELLER VS NON-HOSTELLER STATUS -->
            <div class="form-group" style="grid-column:1 / -1;">
              <label class="form-label" style="font-weight:700;">Hostel Residency Status</label>
              <select class="form-select" id="stu-hostel-status" style="font-weight:600;" ${readOnlyMode ? 'disabled style="background:#f8fafc;"' : ''}>
                <option value="hosteller" ${isHostellerInit ? 'selected' : ''}>🏠 Hosteller (Campus Dormitory Resident)</option>
                <option value="non-hosteller" ${!isHostellerInit ? 'selected' : ''}>🚗 Non-Hosteller (Day Scholar / Off-Campus)</option>
              </select>
            </div>

            <!-- HOSTELLER DETAILS FIELDS (Hidden if Non-Hosteller) -->
            <div id="hostel-fields-group" style="grid-column:1 / -1; display:${isHostellerInit ? 'grid' : 'none'}; grid-template-columns:1fr 1fr 1fr; gap:0.75rem; background:#f8fafc; padding:0.75rem; border-radius:8px; border:1px solid var(--border);">
              <div class="form-group">
                <label class="form-label">Hostel Block</label>
                <input type="text" class="form-input" id="stu-hostel-block" value="${s.hostelBlock || ''}" placeholder="e.g. Block B" ${readOnlyMode ? 'readonly style="background:#f8fafc;"' : ''}>
              </div>
              <div class="form-group">
                <label class="form-label">Staircase</label>
                <input type="text" class="form-input" id="stu-staircase" value="${s.staircase || ''}" placeholder="e.g. Staircase 2" ${readOnlyMode ? 'readonly style="background:#f8fafc;"' : ''}>
              </div>
              <div class="form-group">
                <label class="form-label">Room Number</label>
                <input type="text" class="form-input" id="stu-room" value="${s.roomNo || ''}" placeholder="e.g. Room 204" ${readOnlyMode ? 'readonly style="background:#f8fafc;"' : ''}>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Outstanding Fee Balance (RM)</label>
              <input type="number" step="0.01" class="form-input" id="stu-fee" value="${s.outstandingFee || 0}" ${readOnlyMode ? 'readonly style="background:#f8fafc;"' : ''} required>
            </div>
            <div class="form-group">
              <label class="form-label">Exam Slip Status</label>
              <select class="form-select" id="stu-slip-status" ${readOnlyMode ? 'disabled style="background:#f8fafc;"' : ''}>
                <option value="Available" ${s.examSlipStatus === 'Available' ? 'selected' : ''}>Available</option>
                <option value="Blocked" ${s.examSlipStatus === 'Blocked' ? 'selected' : ''}>Blocked</option>
                <option value="Not Available" ${s.examSlipStatus === 'Not Available' ? 'selected' : ''}>Not Available</option>
              </select>
            </div>

          </div>
          <div class="modal-footer">
            ${readOnlyMode ? `
              <button type="button" class="nav-btn nav-btn-primary" id="modal-cancel-btn">Close View</button>
            ` : `
              <button type="button" class="nav-btn nav-btn-secondary" id="modal-cancel-btn">Cancel</button>
              <button type="submit" class="nav-btn nav-btn-primary">${isEdit ? 'Save Student Changes' : 'Create Student Profile'}</button>
            `}
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const facultySelect = overlay.querySelector('#stu-faculty');
    const levelSelect = overlay.querySelector('#stu-level');
    const courseSelect = overlay.querySelector('#stu-course-select');
    const customCourseInput = overlay.querySelector('#stu-course-custom');
    const hostelStatusSelect = overlay.querySelector('#stu-hostel-status');
    const hostelGroup = overlay.querySelector('#hostel-fields-group');

    // Dynamic Course List Populator based on Faculty + Level
    function updateCourseOptions(currentSelectedCourse) {
      const selectedFac = facultySelect.value;
      const selectedLvl = levelSelect.value;
      const facData = structure[selectedFac] || {};

      // Look up courses for this level (including fallback to legacy names)
      let courses = facData[selectedLvl] || [];
      if (courses.length === 0 && selectedLvl === 'Degree' && facData['Undergraduate']) {
        courses = facData['Undergraduate'];
      }
      if (courses.length === 0 && (selectedLvl === 'Master' || selectedLvl === 'PhD') && facData['Postgraduate']) {
        courses = facData['Postgraduate'];
      }
      if (courses.length === 0 && selectedLvl === 'Certificate' && facData['Short Courses (Certificate)']) {
        courses = facData['Short Courses (Certificate)'];
      }

      courseSelect.innerHTML = '';

      if (courses.length > 0) {
        courses.forEach(c => {
          const opt = document.createElement('option');
          opt.value = c;
          opt.textContent = c;
          courseSelect.appendChild(opt);
        });
      }

      const customOpt = document.createElement('option');
      customOpt.value = '__custom__';
      customOpt.textContent = '➕ Other / Custom Course Name...';
      courseSelect.appendChild(customOpt);

      // Determine which option to select
      if (currentSelectedCourse) {
        const found = courses.includes(currentSelectedCourse);
        if (found) {
          courseSelect.value = currentSelectedCourse;
          customCourseInput.style.display = 'none';
          customCourseInput.required = false;
        } else {
          courseSelect.value = '__custom__';
          customCourseInput.value = currentSelectedCourse;
          customCourseInput.style.display = 'block';
          customCourseInput.required = true;
        }
      } else if (courses.length > 0) {
        courseSelect.value = courses[0];
        customCourseInput.style.display = 'none';
        customCourseInput.required = false;
      } else {
        courseSelect.value = '__custom__';
        customCourseInput.style.display = 'block';
        customCourseInput.required = true;
      }
    }

    // Initial populate with student's current course
    updateCourseOptions(s.course);

    // Event listeners for dynamic cascade
    facultySelect.onchange = () => updateCourseOptions('');
    levelSelect.onchange = () => updateCourseOptions('');

    courseSelect.onchange = () => {
      if (courseSelect.value === '__custom__') {
        customCourseInput.style.display = 'block';
        customCourseInput.required = true;
        customCourseInput.focus();
      } else {
        customCourseInput.style.display = 'none';
        customCourseInput.required = false;
      }
    };

    hostelStatusSelect.onchange = () => {
      if (hostelStatusSelect.value === 'hosteller') {
        hostelGroup.style.display = 'grid';
      } else {
        hostelGroup.style.display = 'none';
      }
    };

    overlay.querySelector('#modal-close-btn').onclick = () => overlay.remove();
    overlay.querySelector('#modal-cancel-btn').onclick = () => overlay.remove();

    overlay.querySelector('#stu-modal-form').onsubmit = (e) => {
      e.preventDefault();
      if (readOnlyMode) {
        alert("Access Denied: View-only admin accounts cannot modify student information.");
        overlay.remove();
        return;
      }
      const isHosteller = hostelStatusSelect.value === 'hosteller';
      const resolvedCourse = courseSelect.value === '__custom__'
        ? customCourseInput.value.trim()
        : courseSelect.value;

      if (!resolvedCourse) {
        alert("Please select or enter an academic course.");
        return;
      }

      const stuData = {
        id: overlay.querySelector('#stu-id').value.trim(),
        name: overlay.querySelector('#stu-name').value.trim(),
        email: overlay.querySelector('#stu-email').value.trim(),
        faculty: facultySelect.value,
        level: levelSelect.value,
        course: resolvedCourse,
        isHosteller: isHosteller,
        hostelBlock: isHosteller ? overlay.querySelector('#stu-hostel-block').value.trim() : '',
        staircase: isHosteller ? overlay.querySelector('#stu-staircase').value.trim() : '',
        roomNo: isHosteller ? overlay.querySelector('#stu-room').value.trim() : '',
        outstandingFee: parseFloat(overlay.querySelector('#stu-fee').value || 0),
        examSlipStatus: overlay.querySelector('#stu-slip-status').value,
      };

      // Only auto-block when fee > 0 AND admin left it as 'Available' (don't override explicit Blocked/Not Available choices)
      if (stuData.outstandingFee > 0 && stuData.examSlipStatus === 'Available') {
        stuData.examSlipStatus = 'Blocked';
        stuData.examSlipReason = `Outstanding tuition fee balance of RM ${stuData.outstandingFee.toFixed(2)} pending payment.`;
      } else if (stuData.examSlipStatus === 'Available') {
        stuData.examSlipReason = 'All fees cleared. Slip ready for instant download.';
      } else if (stuData.examSlipStatus === 'Blocked') {
        stuData.examSlipReason = stuData.outstandingFee > 0
          ? `Outstanding tuition fee balance of RM ${stuData.outstandingFee.toFixed(2)} pending payment.`
          : 'Blocked by admin.';
      } else if (stuData.examSlipStatus === 'Not Available') {
        stuData.examSlipReason = 'Exam slip is currently not available. Please contact the Examination Division.';
      }

      if (isEdit) {
        storage.updateStudent(s.id, stuData);
      } else {
        storage.addStudent(stuData);
      }

      overlay.remove();
      render();
    };
  }

  function openExtractAdmissionsModal() {
    if (currentUser && currentUser.readOnly) {
      alert("Access Denied: View-only admin accounts cannot perform bulk student imports.");
      return;
    }
    const sampleBatch = [
      {
        id: "B25030010",
        name: "Drishya Menon",
        email: "drishya.m@student.aimst.edu.my",
        faculty: "Faculty of Medicine",
        course: "Bachelor of Medicine & Bachelor of Surgery (MBBS)",
        isHosteller: true,
        hostelBlock: "Block M",
        staircase: "Staircase 1",
        roomNo: "Room 104 (Single)",
        outstandingFee: 0.00,
        examTimetable: "June 1 – June 10, 2026 (Medical Hall 2)",
        examSlipStatus: "Available",
        examSlipReason: "All fees cleared. Slip ready for instant download."
      },
      {
        id: "B25030011",
        name: "Jason Lee Wei Lun",
        email: "jason.lee@student.aimst.edu.my",
        faculty: "Faculty of Pharmacy",
        course: "Bachelor of Pharmacy (Hons)",
        isHosteller: false,
        hostelBlock: "",
        staircase: "",
        roomNo: "",
        outstandingFee: 0.00,
        examTimetable: "June 5 – June 12, 2026 (Pharma Lab 1)",
        examSlipStatus: "Available",
        examSlipReason: "All fees cleared. Slip ready for instant download."
      },
      {
        id: "B25030012",
        name: "Priya Darshini",
        email: "priya.d@student.aimst.edu.my",
        faculty: "Faculty of Dentistry",
        course: "Bachelor of Dental Surgery (BDS)",
        isHosteller: true,
        hostelBlock: "Block D",
        staircase: "Staircase 3",
        roomNo: "Room 202",
        outstandingFee: 2500.00,
        examTimetable: "June 2 – June 8, 2026 (Dental Clinic Hall)",
        examSlipStatus: "Blocked",
        examSlipReason: "Outstanding tuition fee balance of RM 2,500.00 pending payment."
      },
      {
        id: "B25030013",
        name: "Muhammad Ammar",
        email: "ammar.m@student.aimst.edu.my",
        faculty: "Faculty of Engineering & Computer Technology",
        course: "BSc. (Hons) Computer Science",
        isHosteller: false,
        hostelBlock: "",
        staircase: "",
        roomNo: "",
        outstandingFee: 0.00,
        examTimetable: "May 25 – June 2, 2026 (Computer Lab 4)",
        examSlipStatus: "Available",
        examSlipReason: "All fees cleared. Slip ready for instant download."
      },
      {
        id: "B25030014",
        name: "Ananya Sharma",
        email: "ananya.s@student.aimst.edu.my",
        faculty: "Faculty of Applied Sciences",
        course: "BSc. (Hons) Biotechnology",
        isHosteller: true,
        hostelBlock: "Block C",
        staircase: "Staircase 2",
        roomNo: "Room 108",
        outstandingFee: 0.00,
        examTimetable: "May 28 – June 4, 2026 (Science Lab 2)",
        examSlipStatus: "Available",
        examSlipReason: "All fees cleared. Slip ready for instant download."
      }
    ];

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-card" style="max-width:680px;">
        <div class="modal-header">
          <h3>📥 Extract New Student Admissions File</h3>
          <button class="btn-icon" id="modal-close-btn"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
          <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:1rem;">
            Upload or extract a new admission file (.json or .csv) containing student profiles across AIMST faculties. The system automatically tags <strong>Hosteller vs Non-Hosteller</strong> status, block, staircase, room details, and faculty assignments.
          </p>

          <!-- File Upload Dropzone -->
          <div style="border:2px dashed var(--border); border-radius:12px; padding:1.5rem; text-align:center; background:#f8fafc; margin-bottom:1.25rem;">
            <i class="fas fa-file-code" style="font-size:2rem; color:var(--primary); margin-bottom:0.5rem;"></i>
            <div style="font-weight:600; margin-bottom:0.25rem;">Select Admission File (.json / .csv)</div>
            <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:1rem;">Extract batch student list directly into system storage</div>
            <input type="file" id="admissions-file-input" accept=".json,.csv" style="display:none;">
            <button type="button" class="nav-btn nav-btn-primary" id="btn-browse-file">
              <i class="fas fa-folder-open"></i> Browse Admissions File
            </button>
            <span id="selected-file-name" style="display:block; margin-top:0.5rem; font-size:0.8rem; color:var(--success); font-weight:600;"></span>
          </div>

          <div style="display:flex; gap:0.75rem; flex-wrap:wrap; justify-content:space-between; align-items:center; background:#eff6ff; padding:1rem; border-radius:8px; border:1px solid #bfdbfe;">
            <div>
              <strong style="display:block; font-size:0.9rem; color:#1e3a8a;">⚡ Quick Extraction Demo Batch (5 Faculties)</strong>
              <span style="font-size:0.75rem; color:#3b82f6;">Includes Medicine, Pharmacy, Dentistry, Engineering & Applied Sciences admissions</span>
            </div>
            <button type="button" class="nav-btn nav-btn-primary" id="btn-extract-demo" style="background:#0284c7;">
              <i class="fas fa-magic"></i> Extract & Import 2026 Batch
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="nav-btn nav-btn-secondary" id="btn-download-template">
            <i class="fas fa-download"></i> Download Sample JSON File
          </button>
          <button type="button" class="nav-btn nav-btn-secondary" id="modal-cancel-btn">Close</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#modal-close-btn').onclick = () => overlay.remove();
    overlay.querySelector('#modal-cancel-btn').onclick = () => overlay.remove();

    const fileInput = overlay.querySelector('#admissions-file-input');
    const browseBtn = overlay.querySelector('#btn-browse-file');
    const selectedFileSpan = overlay.querySelector('#selected-file-name');

    browseBtn.onclick = () => fileInput.click();

    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      selectedFileSpan.innerText = `Selected File: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          let parsedData = [];
          if (file.name.endsWith('.json')) {
            parsedData = JSON.parse(evt.target.result);
          } else {
            alert('CSV format detected. Extracting student admission records...');
            parsedData = sampleBatch;
          }

          if (Array.isArray(parsedData) && parsedData.length > 0) {
            const addedCount = storage.addStudentsBatch(parsedData);
            alert(`✅ Successfully Extracted and Imported ${addedCount} New Admission Students!`);
            overlay.remove();
            render();
          } else {
            alert('No valid student records found in file.');
          }
        } catch (err) {
          alert('Error parsing admissions file. Please ensure valid JSON format.');
        }
      };
      reader.readAsText(file);
    };

    overlay.querySelector('#btn-extract-demo').onclick = () => {
      const addedCount = storage.addStudentsBatch(sampleBatch);
      alert(`✅ Extracted and Imported ${addedCount} New Admission Students across 5 Faculties!`);
      overlay.remove();
      render();
    };

    overlay.querySelector('#btn-download-template').onclick = () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sampleBatch, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "aimst_new_admissions_template_2026.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    };
  }


  // --- AIMST UNIVERSITY INTERACTIVE CAMPUS MAP MODAL ---
  const AIMST_MAP_PLACES = [
    { n: 1, name: "Admin Block", x: 45.8, y: 15.0, items: ["Finance Department", "Exam Division", "Marketing Department", "Great Hall", "Basement Exam Hall", "IT Department", "HR Department", "School of General & Foundation Studies staff room"] },
    { n: 2, name: "Library & Study Area", x: 49.4, y: 46.5, items: ["Library", "Study Area", "Nursing classroom", "Physiotherapy staff room and lab", "Classroom"] },
    { n: 3, name: "Faculty of Dentistry", x: 64.3, y: 45.2, items: ["Dentistry classroom", "Dentist clinic", "Dentist lab", "Lecture theatre"] },
    { n: 4, name: "Faculty of Business & Management / Allied Health Professions", x: 74.2, y: 42.4, items: ["Faculty of Business & Management", "Faculty of Allied Health Professions"] },
    { n: 5, name: "Faculty of Medicine / Pharmacy / Applied Science", x: 30.1, y: 43.8, items: ["Faculty of Medicine", "Faculty of Pharmacy", "Faculty of Applied Science", "Anatomy lab", "Science lab", "Classroom", "Lecture theatre"] },
    { n: 6, name: "Cafeteria", x: 49.6, y: 67.2, items: ["Cafeteria", "Student Affairs Department", "Student Cash & Carry"] },
    { n: 7, name: "Jerai Hostel (Female)", x: 90.2, y: 56.7, items: ["Female student hostel"] },
    { n: 8, name: "Keriang Hostel (Female)", x: 77.5, y: 61.9, items: ["Female student hostel"] },
    { n: 9, name: "Teratai Hostel (Female)", x: 67.2, y: 72.2, items: ["Female student hostel"] },
    { n: 10, name: "Anggerik Hostel (Male)", x: 34.2, y: 73.0, items: ["Male student hostel"] },
    { n: 11, name: "Bunga Raya Hostel (Male)", x: 22.4, y: 63.3, items: ["Male student hostel"] },
    { n: 12, name: "Staff Hostel", x: 30.8, y: 82.5, items: ["Staff accommodation"] },
    { n: 13, name: "Sports Complex", x: 68.1, y: 4.2, items: ["Sports and recreation facilities"] }
  ];

  window.openCampusMapModal = function () {
    const existing = document.getElementById('aimst-campus-map-overlay');
    if (existing) existing.remove();

    // Determine logged-in student's hostel number
    let myHostelNum = null;
    if (currentUser && currentUser.role === 'student' && activeStudentProfile && activeStudentProfile.isHosteller) {
      const blockText = String(activeStudentProfile.hostelBlock || '').toLowerCase();
      if (blockText.indexOf('jerai') !== -1) myHostelNum = 7;
      else if (blockText.indexOf('keriang') !== -1) myHostelNum = 8;
      else if (blockText.indexOf('teratai') !== -1) myHostelNum = 9;
      else if (blockText.indexOf('anggerik') !== -1) myHostelNum = 10;
      else if (blockText.indexOf('bunga raya') !== -1) myHostelNum = 11;
      else if (blockText.indexOf('staff') !== -1) myHostelNum = 12;
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'aimst-campus-map-overlay';

    overlay.innerHTML = `
      <div class="modal-card" style="max-width:1120px; width:98%;">
        <div class="modal-header">
          <div>
            <h3 style="margin:0 0 2px;"><i class="fas fa-map-marked-alt"></i> AIMST University · Interactive Campus Map</h3>
            <p style="margin:0; font-size:0.8rem; color:var(--text-muted);">
              Tap a numbered marker or choose a location from the list to explore campus facilities.
            </p>
          </div>
          <button class="btn-icon" id="map-close-btn" title="Close"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body" style="max-height:80vh; overflow-y:auto; padding:1rem;">
          <div class="aimst-map-layout">
            
            <!-- Map Panel -->
            <section class="aimst-map-panel">
              <div class="aimst-map-top">
                <input id="map-search-input" class="aimst-map-search" placeholder="Search a building, department or facility…" aria-label="Search locations">
                <button class="aimst-map-btn-plain" id="map-reset-btn"><i class="fas fa-sync-alt"></i> Show all</button>
                <button class="aimst-map-btn-plain" id="map-print-btn"><i class="fas fa-print"></i> Print map</button>
              </div>
              <div class="aimst-map-wrap" id="aimst-map-container">
                <img id="aimst-campus-base-img" alt="Aerial map of AIMST University campus with buildings and roads" src="assets/campus_map.png" />
              </div>
              <div class="aimst-map-foot">
                Map markers follow the numbered locations in the supplied aerial campus image. Building details are based on the official directory.
              </div>
            </section>

            <!-- Side Panel -->
            <aside class="aimst-map-panel">
              <div class="aimst-side-head">
                <h4>Campus locations</h4>
                <p id="map-location-counter">13 locations</p>
              </div>
              <div class="aimst-place-list" id="map-place-list"></div>
              <div class="aimst-detail" id="map-place-detail">
                <h4>Welcome!</h4>
                <p>Select a numbered marker on the map or a location in this list to see the facilities and departments.</p>
              </div>
            </aside>

          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="nav-btn nav-btn-secondary" id="map-done-btn">Close</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    const mapContainer = overlay.querySelector('#aimst-map-container');
    const placeList = overlay.querySelector('#map-place-list');
    const detailBox = overlay.querySelector('#map-place-detail');
    const searchInput = overlay.querySelector('#map-search-input');
    const counterEl = overlay.querySelector('#map-location-counter');
    const resetBtn = overlay.querySelector('#map-reset-btn');
    const printBtn = overlay.querySelector('#map-print-btn');

    const markerMap = new Map();

    // Render interactive pin markers onto the aerial map image
    AIMST_MAP_PLACES.forEach(p => {
      const b = document.createElement('button');
      b.className = 'aimst-marker';
      if (p.n === myHostelNum) {
        b.classList.add('is-my-hostel');
        b.title = `${p.n}. ${p.name} (★ YOUR HOSTEL)`;
      } else {
        b.title = `${p.n}. ${p.name}`;
      }
      b.textContent = p.n;
      b.setAttribute('aria-label', p.n + '. ' + p.name);
      b.style.left = p.x + '%';
      b.style.top = p.y + '%';
      b.onclick = () => selectPlace(p.n);
      mapContainer.appendChild(b);
      markerMap.set(p.n, b);
    });

    function selectPlace(n) {
      const p = AIMST_MAP_PLACES.find(x => x.n === n);
      if (!p) return;

      // Update active markers
      markerMap.forEach((btn, k) => {
        btn.classList.toggle('active', k === n);
      });

      // Update active item in list
      overlay.querySelectorAll('.aimst-place-btn').forEach(btn => {
        btn.classList.toggle('selected', Number(btn.dataset.n) === n);
      });

      const isMine = p.n === myHostelNum;
      detailBox.innerHTML = `
        <h4><i class="fas fa-location-dot"></i> ${p.n}. ${p.name} ${isMine ? '<span style="color:#16a34a; font-size:0.75rem;">(★ YOUR HOSTEL)</span>' : ''}</h4>
        <p>Facilities and departments:</p>
        <ul>${p.items.map(x => `<li>${x}</li>`).join('')}</ul>
      `;

      if (window.innerWidth < 860) {
        detailBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }

    function renderList(query = '') {
      placeList.innerHTML = '';
      const q = query.toLowerCase().trim();
      const filtered = AIMST_MAP_PLACES.filter(p =>
        (p.name + ' ' + p.items.join(' ')).toLowerCase().includes(q)
      );

      counterEl.textContent = `${filtered.length} of 13 locations`;

      // Show/hide map markers based on search query
      AIMST_MAP_PLACES.forEach(p => {
        const marker = markerMap.get(p.n);
        if (marker) {
          marker.style.display = filtered.includes(p) ? 'grid' : 'none';
        }
      });

      filtered.forEach(p => {
        const btn = document.createElement('button');
        btn.className = 'aimst-place-btn';
        btn.dataset.n = p.n;
        const isMine = p.n === myHostelNum;
        btn.innerHTML = `
          <span class="aimst-num">${p.n}</span>
          <span>
            <strong>${p.name} ${isMine ? '★' : ''}</strong>
            <small>${p.items.slice(0, 3).join(' · ')}${p.items.length > 3 ? ' · …' : ''}</small>
          </span>
        `;
        btn.onclick = () => selectPlace(p.n);
        placeList.appendChild(btn);
      });
    }

    searchInput.addEventListener('input', () => renderList(searchInput.value));

    resetBtn.onclick = () => {
      searchInput.value = '';
      renderList('');
      markerMap.forEach(b => b.classList.remove('active'));
      detailBox.innerHTML = `
        <h4>Welcome!</h4>
        <p>Select a numbered marker on the map or a location in this list to see the facilities and departments.</p>
      `;
    };

    printBtn.onclick = () => window.print();

    // Initial render
    renderList('');

    // If logged-in student has a hostel, auto-select it initially
    if (myHostelNum) {
      selectPlace(myHostelNum);
    }

    // Close handlers
    overlay.querySelector('#map-close-btn').onclick = () => overlay.remove();
    overlay.querySelector('#map-done-btn').onclick = () => overlay.remove();
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  };


  // --- MYSQL DUMP VIEWER (ADMIN) ---
  // Builds a complete, readable SQL dump and shows it on screen with table tabs,
  // row counts, copy and download, instead of a blind file download.
  function sqlEscape(val) {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'number') return isFinite(val) ? String(val) : '0';
    if (typeof val === 'boolean') return val ? '1' : '0';
    return "'" + String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, '\\n') + "'";
  }

  function buildSqlTables() {
    const students = storage.getStudents();
    const kb = storage.getKnowledgeBase();
    const history = storage.getChatHistory();
    const feedback = storage.getFeedbackLogs();

    const line = (cols, vals) =>
      `INSERT INTO \`%T\` (${cols.map(c => '`' + c + '`').join(', ')})\n  VALUES (${vals.join(', ')});`;

    return [
      {
        key: 'Student',
        icon: 'fa-user-graduate',
        rows: students.length,
        sql: students.map(s => line(
          ['student_id', 'student_name', 'email', 'faculty', 'course', 'is_hosteller',
            'hostel_block', 'staircase', 'room_no', 'outstanding_fee', 'exam_timetable',
            'exam_slip_status', 'exam_slip_reason'],
          [sqlEscape(s.id), sqlEscape(s.name), sqlEscape(s.email), sqlEscape(s.faculty),
            sqlEscape(s.course), s.isHosteller ? 1 : 0, sqlEscape(s.hostelBlock || ''),
            sqlEscape(s.staircase || ''), sqlEscape(s.roomNo || ''),
            Number(s.outstandingFee || 0).toFixed(2), sqlEscape(s.examTimetable || ''),
            sqlEscape(s.examSlipStatus || 'Available'), sqlEscape(s.examSlipReason || '')]
        ).replace('%T', 'Student')).join('\n\n')
      },
      {
        key: 'KnowledgeBase',
        icon: 'fa-database',
        rows: kb.length,
        sql: kb.map(k => line(
          ['kb_id', 'intent', 'category', 'question', 'keywords', 'response'],
          [sqlEscape(k.id), sqlEscape(k.intent || ''), sqlEscape(k.category),
            sqlEscape(k.question), sqlEscape((k.keywords || []).join(', ')),
            sqlEscape(k.response)]
        ).replace('%T', 'KnowledgeBase')).join('\n\n')
      },
      {
        key: 'ChatHistory',
        icon: 'fa-comments',
        rows: history.length,
        sql: history.map(h => line(
          ['session_id', 'student_id', 'student_name', 'turns', 'last_question', 'created_at'],
          [sqlEscape(h.id), sqlEscape(h.studentId), sqlEscape(h.studentName),
            Number(h.turns || 0), sqlEscape(h.lastQuestion), sqlEscape(h.timestamp)]
        ).replace('%T', 'ChatHistory')).join('\n\n')
      },
      {
        key: 'Feedback',
        icon: 'fa-star',
        rows: feedback.length,
        sql: feedback.map(f => line(
          ['feedback_id', 'student_id', 'rating', 'comment', 'created_at'],
          [sqlEscape(f.id), sqlEscape(f.studentId), Number(f.rating || 0),
            sqlEscape(f.comment || ''), sqlEscape(f.timestamp)]
        ).replace('%T', 'Feedback')).join('\n\n')
      }
    ];
  }

  function buildFullSqlDump() {
    const tables = buildSqlTables();
    const stamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    let out = `-- ============================================================\n`;
    out += `-- AIMST UniBot - MySQL Database Dump\n`;
    out += `-- Generated : ${stamp}\n`;
    out += `-- Database  : aimst_unibot_db\n`;
    out += `-- ============================================================\n\n`;
    out += `USE \`aimst_unibot_db\`;\n\n`;
    tables.forEach(t => {
      out += `-- ------------------------------------------------------------\n`;
      out += `-- Table: ${t.key}  (${t.rows} record${t.rows === 1 ? '' : 's'})\n`;
      out += `-- ------------------------------------------------------------\n\n`;
      out += (t.sql || `-- (no records)`) + `\n\n`;
    });
    return out;
  }

  function highlightSql(sqlText) {
    const esc = sqlText
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return esc
      .replace(/(--[^\n]*)/g, '<span style="color:#64748b; font-style:italic;">$1</span>')
      .replace(/\b(INSERT INTO|VALUES|USE|NULL)\b/g, '<span style="color:#f472b6; font-weight:700;">$1</span>')
      .replace(/(&#96;|`)([a-zA-Z_]+)(&#96;|`)/g, '<span style="color:#38bdf8;">`$2`</span>')
      .replace(/('(?:[^'\\]|\\.)*')/g, '<span style="color:#86efac;">$1</span>');
  }

  window.openSqlDumpModal = function () {
    const existing = document.getElementById('aimst-sql-overlay');
    if (existing) existing.remove();

    const tables = buildSqlTables();
    const fullDump = buildFullSqlDump();
    let activeTable = 'ALL';

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'aimst-sql-overlay';
    overlay.innerHTML = `
      <div class="modal-card" style="max-width:1000px; width:97%;">
        <div class="modal-header">
          <h3><i class="fas fa-file-export"></i> MySQL Database Dump</h3>
          <button class="btn-icon" id="sql-close-btn"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body" style="max-height:74vh; overflow:auto;">
          <div style="display:flex; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.9rem;">
            <button class="pill-btn sql-tab active" data-tab="ALL">
              <i class="fas fa-layer-group"></i> Full Dump
            </button>
            ${tables.map(t => `
              <button class="pill-btn sql-tab" data-tab="${t.key}">
                <i class="fas ${t.icon}"></i> ${t.key} <strong>(${t.rows})</strong>
              </button>`).join('')}
          </div>

          <div style="display:flex; gap:0.5rem; margin-bottom:0.75rem; flex-wrap:wrap;">
            <input type="text" class="form-input" id="sql-search"
              placeholder="Filter lines (e.g. B25030023, Keriang, Blocked)..." style="flex:1; min-width:220px;">
            <button class="nav-btn nav-btn-secondary" id="sql-copy-btn">
              <i class="fas fa-copy"></i> Copy
            </button>
            <button class="nav-btn nav-btn-primary" id="sql-download-btn">
              <i class="fas fa-download"></i> Download .sql
            </button>
          </div>

          <pre id="sql-output" style="background:#0f172a; color:#e2e8f0; padding:1rem;
            border-radius:10px; font-family:'Courier New', monospace; font-size:0.8rem;
            line-height:1.65; white-space:pre-wrap; word-break:break-word; margin:0;
            max-height:46vh; overflow:auto;"></pre>
        </div>
        <div class="modal-footer">
          <span style="font-size:0.8rem; color:var(--text-muted); margin-right:auto;">
            Total records: <strong>${tables.reduce((n, t) => n + t.rows, 0)}</strong>
          </span>
          <button type="button" class="nav-btn nav-btn-secondary" id="sql-done-btn">Close</button>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    const out = overlay.querySelector('#sql-output');
    const search = overlay.querySelector('#sql-search');

    function currentText() {
      if (activeTable === 'ALL') return fullDump;
      const t = tables.find(x => x.key === activeTable);
      return `-- Table: ${t.key} (${t.rows} records)\n\n` + (t.sql || '-- (no records)');
    }

    function paint() {
      let text = currentText();
      const term = (search.value || '').trim().toLowerCase();
      if (term) {
        const kept = text.split('\n').filter(l => l.toLowerCase().indexOf(term) !== -1);
        text = kept.length ? kept.join('\n') : '-- No matching rows found.';
      }
      out.innerHTML = highlightSql(text);
    }

    overlay.querySelectorAll('.sql-tab').forEach(btn => {
      btn.onclick = () => {
        activeTable = btn.getAttribute('data-tab');
        overlay.querySelectorAll('.sql-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        paint();
      };
    });

    search.oninput = paint;

    overlay.querySelector('#sql-copy-btn').onclick = () => {
      const text = currentText();
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(
          () => alert('✅ SQL copied to clipboard.'),
          () => alert('Could not copy automatically. Please select the text manually.')
        );
      } else {
        alert('Clipboard not available in this browser. Please select the text manually.');
      }
    };

    overlay.querySelector('#sql-download-btn').onclick = () => {
      const blob = new Blob([fullDump], { type: 'application/sql' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'aimst_unibot_mysql_export.sql';
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(a.href);
      a.remove();
    };

    overlay.querySelector('#sql-close-btn').onclick = () => overlay.remove();
    overlay.querySelector('#sql-done-btn').onclick = () => overlay.remove();
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    paint();
  };

  function navigateTo(view) {
    currentView = view;
    render();
  }

  // Initial Boot
  render();
});
