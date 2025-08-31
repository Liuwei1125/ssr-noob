// 用户列表页面特定的JavaScript交互脚本

document.addEventListener('DOMContentLoaded', function() {
  // 搜索功能
  setupSearchFunctionality();
  
  // 排序功能
  setupSortFunctionality();
  
  // 批量操作
  setupBulkOperations();
  
  // 表格行悬停效果
  setupTableRowHoverEffects();
  
  // 初始化动画效果
  if (window.App && window.App.addSimpleAnimations) {
    window.App.addSimpleAnimations();
  }
});

// 搜索功能
function setupSearchFunctionality() {
  const searchInput = document.querySelector('#userSearch');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase().trim();
      const userRows = document.querySelectorAll('tbody tr');
      
      userRows.forEach(row => {
        const rowText = row.textContent.toLowerCase();
        if (rowText.includes(searchTerm)) {
          row.style.display = '';
          row.classList.add('fade-in');
        } else {
          row.style.display = 'none';
        }
      });
    });
  }
}

// 排序功能
function setupSortFunctionality() {
  const sortButtons = document.querySelectorAll('.sort-button');
  sortButtons.forEach(button => {
    button.addEventListener('click', function() {
      const column = this.getAttribute('data-column');
      const direction = this.getAttribute('data-direction') === 'asc' ? 'desc' : 'asc';
      
      // 更新所有排序按钮的状态
      sortButtons.forEach(btn => {
        btn.setAttribute('data-direction', 'asc');
        btn.innerHTML = btn.innerHTML.replace(' ▲', '').replace(' ▼', '') + ' ▲';
      });
      
      // 更新当前按钮的状态
      this.setAttribute('data-direction', direction);
      this.innerHTML = this.innerHTML.replace(' ▲', '').replace(' ▼', '') + (direction === 'asc' ? ' ▲' : ' ▼');
      
      // 排序表格
      sortTable(column, direction);
    });
  });
}

// 表格排序逻辑
function sortTable(column, direction) {
  const table = document.querySelector('table');
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.querySelectorAll('tr'));
  
  // 定义排序比较函数
  const compare = (a, b) => {
    let aValue = a.querySelector(`[data-column="${column}"]`).textContent.trim();
    let bValue = b.querySelector(`[data-column="${column}"]`).textContent.trim();
    
    // 尝试转换为数字进行比较
    if (!isNaN(aValue) && !isNaN(bValue)) {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    }
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  };
  
  // 排序并重新附加行
  rows.sort(compare).forEach(row => {
    tbody.appendChild(row);
  });
}

// 批量操作
function setupBulkOperations() {
  const selectAllCheckbox = document.querySelector('#selectAll');
  const userCheckboxes = document.querySelectorAll('tbody input[type="checkbox"]');
  const deleteSelectedButton = document.querySelector('#deleteSelected');
  
  if (selectAllCheckbox && userCheckboxes.length > 0) {
    // 全选/取消全选
    selectAllCheckbox.addEventListener('change', function() {
      userCheckboxes.forEach(checkbox => {
        checkbox.checked = this.checked;
      });
      updateDeleteSelectedButton();
    });
    
    // 单个复选框改变
    userCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        updateSelectAllCheckbox();
        updateDeleteSelectedButton();
      });
    });
    
    // 删除选中的用户
          if (deleteSelectedButton) {
            deleteSelectedButton.addEventListener('click', function() {
              const selectedIds = Array.from(userCheckboxes)
                .filter(checkbox => checkbox.checked)
                .map(checkbox => parseInt(checkbox.value));
              
              if (selectedIds.length > 0 && confirm(`确定要删除选中的 ${selectedIds.length} 个用户吗？`)) {
                // 显示加载指示器
                const loadingIndicator = showLoadingIndicator();
                
                // 调用后端API进行批量删除
                fetch('/users/api/batch-delete', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ ids: selectedIds })
                })
                .then(response => {
                  if (!response.ok) {
                    throw new Error('删除失败');
                  }
                  return response.json();
                })
                .then(data => {
                  // 隐藏加载指示器
                  hideLoadingIndicator();
                  
                  // 显示成功消息
                  alert(`成功删除了 ${data.length} 个用户`);
                  
                  // API成功返回后，移除页面上已删除的用户行
                  // 先收集所有需要删除的行
                  const rowsToRemove = Array.from(userCheckboxes)
                    .filter(checkbox => checkbox.checked)
                    .map(checkbox => checkbox.closest('tr'));
                  
                  // 为删除的行添加淡出动画
                  rowsToRemove.forEach(row => {
                    row.style.transition = 'opacity 0.3s, transform 0.3s';
                    row.style.opacity = '0';
                    row.style.transform = 'translateX(-10px)';
                  });
                  
                  // 等待动画完成后再从DOM中移除
                  setTimeout(() => {
                    rowsToRemove.forEach(row => row.remove());
                    
                    // 更新全选复选框和删除按钮状态
                    updateSelectAllCheckbox();
                    updateDeleteSelectedButton();
                    
                    // 检查是否还有用户行
                    const remainingRows = document.querySelectorAll('tbody tr');
                    if (remainingRows.length === 0) {
                      // 如果没有用户行，刷新页面获取空状态
                      window.location.reload();
                    }
                  }, 300);
                })
                .catch(error => {
                  // 隐藏加载指示器
                  hideLoadingIndicator();
                  
                  // 显示错误消息
                  alert('批量删除失败：' + error.message);
                });
              }
            });
          }
  }
}

// 更新全选复选框状态
function updateSelectAllCheckbox() {
  const selectAllCheckbox = document.querySelector('#selectAll');
  const userCheckboxes = document.querySelectorAll('tbody input[type="checkbox"]');
  const checkedCheckboxes = document.querySelectorAll('tbody input[type="checkbox"]:checked');
  
  selectAllCheckbox.checked = userCheckboxes.length > 0 && userCheckboxes.length === checkedCheckboxes.length;
}

// 更新删除选中按钮状态
function updateDeleteSelectedButton() {
  const deleteSelectedButton = document.querySelector('#deleteSelected');
  const checkedCheckboxes = document.querySelectorAll('tbody input[type="checkbox"]:checked');
  
  if (deleteSelectedButton) {
    deleteSelectedButton.disabled = checkedCheckboxes.length === 0;
  }
}

// 表格行悬停效果
function setupTableRowHoverEffects() {
  const tableRows = document.querySelectorAll('tbody tr');
  
  tableRows.forEach(row => {
    row.addEventListener('mouseenter', function() {
      this.classList.add('hovered');
    });
    
    row.addEventListener('mouseleave', function() {
      this.classList.remove('hovered');
    });
  });
}

// 添加加载指示器
function showLoadingIndicator() {
  const loadingIndicator = document.createElement('div');
  loadingIndicator.id = 'loadingIndicator';
  loadingIndicator.className = 'loading-indicator';
  loadingIndicator.innerHTML = '<div class="spinner"></div><span>加载中...</span>';
  
  document.body.appendChild(loadingIndicator);
  
  // 添加样式
  const style = document.createElement('style');
  style.textContent = `
    .loading-indicator {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: rgba(255, 255, 255, 0.9);
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      z-index: 1000;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #3498db;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  
  document.head.appendChild(style);
  
  return loadingIndicator;
}

// 隐藏加载指示器
function hideLoadingIndicator() {
  const loadingIndicator = document.querySelector('#loadingIndicator');
  if (loadingIndicator) {
    loadingIndicator.remove();
  }
}