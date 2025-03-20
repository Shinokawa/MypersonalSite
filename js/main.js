document.addEventListener('DOMContentLoaded', function() {
    // 导航菜单切换
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    
    if (menuToggle && nav) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            menuToggle.classList.toggle('active');
        });
    }
    
    // 页面滚动动画效果
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.project-card, .section-title, .hero-content');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.classList.add('animate');
            }
        });
    };
    
    // 初始检查
    animateOnScroll();
    
    // 滚动时检查
    window.addEventListener('scroll', animateOnScroll);

    // 表单提交处理
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        // 防止重复提交
        let lastSubmissionTime = 0;
        const SUBMISSION_COOLDOWN = 60000; 
        
        // 生成表单 token 
        function generateToken() {
            return Math.random().toString(36).substring(2, 15) + 
                   Math.random().toString(36).substring(2, 15);
        }
        
        // 存储生成的token
        const formToken = generateToken();
        localStorage.setItem('contactFormToken', formToken);
        
        // 初始化EmailJS
        (function() {
            emailjs.init("YOUR_USER_ID");
        })();
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 获取表单状态显示区域
            const formStatus = contactForm.querySelector('.form-status');
            
            // 检查蜜罐是否被填写 
            const honeypot = document.getElementById('website').value;
            if (honeypot) {

                formStatus.textContent = '消息已发送！我们会尽快回复您。';
                formStatus.className = 'form-status success';
                contactForm.reset();
                return;
            }
            
            // 检查冷却时间
            const now = Date.now();
            if (now - lastSubmissionTime < SUBMISSION_COOLDOWN) {
                const remainingTime = Math.ceil((SUBMISSION_COOLDOWN - (now - lastSubmissionTime)) / 1000);
                formStatus.textContent = `请等待 ${remainingTime} 秒后再次提交`;
                formStatus.className = 'form-status error';
                return;
            }
            
            // CSRF令牌验证
            const storedToken = localStorage.getItem('contactFormToken');
            if (!storedToken) {
                formStatus.textContent = '安全验证失败，请刷新页面重试。';
                formStatus.className = 'form-status error';
                return;
            }
            
            // 简单验证
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            if (!name || !email || !subject || !message) {
                formStatus.textContent = '请填写所有字段';
                formStatus.className = 'form-status error';
                return;
            }
            
            // 验证邮箱格式
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                formStatus.textContent = '请输入有效的邮箱地址';
                formStatus.className = 'form-status error';
                return;
            }
            
            // 内容长度限制检查
            if (name.length > 50 || email.length > 100 || subject.length > 100 || message.length > 1000) {
                formStatus.textContent = '输入内容过长';
                formStatus.className = 'form-status error';
                return;
            }
            
            // 显示发送中状态
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '发送中...';
            formStatus.textContent = '正在发送...';
            formStatus.className = 'form-status';
            
            // 准备要发送的参数
            const templateParams = {
                from_name: name,
                from_email: email,
                subject: subject,
                message: message,
                form_token: storedToken, 
                submission_time: new Date().toString()
            };
            
            // 记录提交时间
            lastSubmissionTime = now;
            
            // 生成新token用于下次提交
            localStorage.setItem('contactFormToken', generateToken());
            
            // 发送邮件
            emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', templateParams)
                .then(function(response) {
                    console.log('邮件已发送!', response.status, response.text);
                    formStatus.textContent = '消息已发送！我们会尽快回复您。';
                    formStatus.className = 'form-status success';
                    contactForm.reset();
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }, function(error) {
                    console.log('发送失败...', error);
                    formStatus.textContent = '发送失败，请稍后再试或直接联系我的邮箱。';
                    formStatus.className = 'form-status error';
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                });
        });
    }
});