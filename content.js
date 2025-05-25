// Threads 帳號標示器 - Content Script

let accountList = [];
let listName = '';
let observer = null;

// 初始化
init();

async function init() {
    // 載入帳號名單
    await loadAccountList();
    
    // 開始監控頁面變化
    startObserver();
    
    // 立即檢查現有內容
    markAccounts();
}

// 載入帳號名單
function loadAccountList() {
    return new Promise((resolve) => {
        chrome.storage.sync.get(['accountList', 'listName'], function(result) {
            accountList = result.accountList || [];
            listName = result.listName || '';
            console.log('載入帳號名單:', accountList);
            resolve();
        });
    });
}

// 監聽來自 popup 的訊息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateAccountList') {
        accountList = request.accounts || [];
        console.log('更新名單 - ' + listName, accountList);
        
        // 移除所有現有標記
        removeAllMarkers();
        
        // 重新標記
        markAccounts();
        
        sendResponse({success: true});
    }
});

// 開始觀察 DOM 變化
function startObserver() {
    if (observer) {
        observer.disconnect();
    }

    observer = new MutationObserver(function(mutations) {
        let shouldCheck = false;
        
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // 檢查是否有新增的節點包含用戶信息
                for (let node of mutation.addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.querySelector && (
                            node.querySelector('[href*="/@"]') || 
                            node.matches('[href*="/@"]') 
                        )) {
                            shouldCheck = true;
                            break;
                        }
                    }
                }
            }
        });
        
        if (shouldCheck) {
            // 延遲執行，避免過於頻繁
            setTimeout(markAccounts, 100);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// 標記帳號
function markAccounts() {
    if (accountList.length === 0) return;

    // 尋找所有可能的用戶連結
    const userLinks = Array.from(document.querySelectorAll('a[href*="/@"]:not([data-account-marked])'))
      .filter(link => {
      const href = link.getAttribute('href');
      // 僅匹配 "/@username" 或 "/@username?..."，不包含 "/@username/xxx"
      const isUserLink = /^\/@[^\/\?]+(\?.*)?$/.test(href);
      // 過濾掉含有 <img> 的 <a>
      const hasImg = link.querySelector('img') !== null;
      const isTab = link.getAttribute('aria-label') === '串文';
      return isUserLink && !hasImg && !isTab;
      });
    
    userLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (!href) return;
        
        // 提取用戶名
        const usernameMatch = href.match(/@([^/?]+)/);
        if (!usernameMatch) return;
        
        const username = usernameMatch[1].toLowerCase();
        
        // 檢查是否在名單中
        if (accountList.includes(username)) {
            addMarker(link, username);
        }
        
        // 標記為已檢查，避免重複處理
        link.setAttribute('data-account-marked', 'true');
    });
}

// 添加標記圖示
function addMarker(element, username) {
    // 避免重複添加
    if (element.querySelector('.account-marker')) return;
    
    // 創建標記元素
    const marker = document.createElement('div');
    marker.className = 'account-marker';
    marker.innerHTML = '⚠️';
    marker.title = `此帳號在「${listName}」中：@${username}`;
    

    // 嘗試找到用戶名文字所在的元素
    let targetElement = element;
    
    
    // 如果目標元素的顯示方式是 flex 或 inline-flex，直接添加
    const computedStyle = window.getComputedStyle(targetElement);
    if (computedStyle.display.includes('flex')) {
        targetElement.appendChild(marker);
    } else {
        // 否則創建一個容器
        const container = document.createElement('span');
        container.style.display = 'inline-flex';
        container.style.alignItems = 'center';
        container.style.gap = '4px';
        
        // 將原內容移到容器中
        const originalContent = targetElement.innerHTML;
        targetElement.innerHTML = '';
        container.innerHTML = originalContent;
        container.appendChild(marker);
        targetElement.appendChild(container);
    }
}

// 移除所有標記
function removeAllMarkers() {
    const markers = document.querySelectorAll('.account-marker');
    markers.forEach(marker => marker.remove());
    
    // 清除標記屬性
    const markedElements = document.querySelectorAll('[data-account-marked]');
    markedElements.forEach(element => {
        element.removeAttribute('data-account-marked');
    });
}

// 頁面卸載時清理
window.addEventListener('beforeunload', () => {
    if (observer) {
        observer.disconnect();
    }
});