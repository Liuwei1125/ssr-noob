// 主要的前端交互脚本

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
  // 表单提交处理
  handleFormSubmissions();
  
  // 编辑表单验证
  setupEditFormValidation();
  
  // 添加用户表单验证
  setupAddUserFormValidation();
  
  // 删除确认对话框
  setupDeleteConfirmations();
  
  // 响应式导航
  setupResponsiveNavigation();
});

// 表单提交处理
function handleFormSubmissions() {
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      // 在这里可以添加全局的表单提交前处理
    });
  });
}

// 编辑表单验证
function setupEditFormValidation() {
  const editForm = document.querySelector('#editUserForm');
  if (editForm) {
    editForm.addEventListener('submit', function(e) {
      const name = document.querySelector('#name').value.trim();
      const age = document.querySelector('#age').value;
      const email = document.querySelector('#email').value.trim();
      let isValid = true;
      let errorMessage = '';
      
      if (!name) {
        isValid = false;
        errorMessage += '姓名不能为空\n';
      }
      
      if (!age || isNaN(age) || age <= 0) {
        isValid = false;
        errorMessage += '请输入有效的年龄\n';
      }
      
      if (!email) {
        isValid = false;
        errorMessage += '邮箱不能为空\n';
      } else if (!isValidEmail(email)) {
        isValid = false;
        errorMessage += '请输入有效的邮箱地址\n';
      }
      
      if (!isValid) {
        e.preventDefault();
        alert(errorMessage);
      }
    });
  }
}

// 添加用户表单验证
function setupAddUserFormValidation() {
  const addForm = document.querySelector('#addUserForm');
  if (addForm) {
    addForm.addEventListener('submit', function(e) {
      const name = document.querySelector('#name').value.trim();
      const age = document.querySelector('#age').value;
      const email = document.querySelector('#email').value.trim();
      let isValid = true;
      let errorMessage = '';
      
      if (!name) {
        isValid = false;
        errorMessage += '姓名不能为空\n';
      }
      
      if (!age || isNaN(age) || age <= 0) {
        isValid = false;
        errorMessage += '请输入有效的年龄\n';
      }
      
      if (!email) {
        isValid = false;
        errorMessage += '邮箱不能为空\n';
      } else if (!isValidEmail(email)) {
        isValid = false;
        errorMessage += '请输入有效的邮箱地址\n';
      }
      
      if (!isValid) {
        e.preventDefault();
        alert(errorMessage);
      }
    });
  }
}

// 删除确认对话框
function setupDeleteConfirmations() {
  const deleteButtons = document.querySelectorAll('.delete-button');
  deleteButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      const userId = this.getAttribute('data-id');
      const userName = this.getAttribute('data-name');
      
      if (!confirm(`确定要删除用户 "${userName}" 吗？此操作无法撤销。`)) {
        e.preventDefault();
      }
    });
  });
}

// 响应式导航
function setupResponsiveNavigation() {
  // 这里可以添加响应式导航的逻辑
}

// 邮箱验证辅助函数
function isValidEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

// 添加简单的动画效果
function addSimpleAnimations() {
  const elements = document.querySelectorAll('.fade-in');
  elements.forEach(element => {
    element.style.opacity = '0';
    element.style.transition = 'opacity 0.5s ease-in-out';
  });
  
  // 检测元素是否在视口中
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  elements.forEach(element => {
    observer.observe(element);
  });
}

// 导出函数以便在其他脚本中使用
window.App = {
  isValidEmail,
  addSimpleAnimations
};