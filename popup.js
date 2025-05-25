document.addEventListener('DOMContentLoaded', function() {
    const accountListTextarea = document.getElementById('accountList');
    const listNameInput = document.getElementById('listName');
    const saveBtn = document.getElementById('saveBtn');
    const clearBtn = document.getElementById('clearBtn');
    const status = document.getElementById('status');
    const countInfo = document.getElementById('countInfo');

    // 載入已儲存的帳號名單
    loadAccountList();

    // 更新帳號數量顯示
    function updateCountInfo() {
        const accounts = accountListTextarea.value
            .split('\n')
            .map(account => account.trim())
            .filter(account => account.length > 0);
        
        countInfo.textContent = `目前名單中有 ${accounts.length} 個帳號`;
    }

    // 監聽輸入變化
    accountListTextarea.addEventListener('input', updateCountInfo);

    // 載入帳號名單
    function loadAccountList() {
        chrome.storage.sync.get(['accountList'], function(result) {
            if (result.accountList) {
                accountListTextarea.value = result.accountList.join('\n');
                updateCountInfo();
            }
        });
    }

    // 顯示狀態訊息
    function showStatus(message, isSuccess = true) {
        status.textContent = message;
        status.className = `status ${isSuccess ? 'success' : 'error'}`;
        status.style.display = 'block';
        
        setTimeout(() => {
            status.style.display = 'none';
        }, 3000);
    }

    // 儲存帳號名單
    saveBtn.addEventListener('click', function() {
        const inputText = accountListTextarea.value;
        const listName = listNameInput.value.trim();
        const accounts = inputText
            .split('\n')
            .map(account => account.trim().toLowerCase())
            .filter(account => account.length > 0);

        // 去除重複帳號
        const uniqueAccounts = [...new Set(accounts)];

        chrome.storage.sync.set({
            accountList: uniqueAccounts,
            listName: listName
        }, function() {
            if (chrome.runtime.lastError) {
                showStatus('儲存失敗：' + chrome.runtime.lastError.message, false);
            } else {
                showStatus(`✅ 成功儲存 ${uniqueAccounts.length} 個帳號！`);
                updateCountInfo();
                
                // 通知 content script 更新
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    if (tabs[0] && tabs[0].url.includes('threads.net')) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            action: 'updateAccountList',
                            accounts: uniqueAccounts
                        });
                    }
                });
            }
        });
    });

    // 清空名單
    clearBtn.addEventListener('click', function() {
        if (confirm('確定要清空所有帳號名單嗎？')) {
            accountListTextarea.value = '';
            updateCountInfo();
            
            chrome.storage.sync.remove(['accountList'], function() {
                showStatus('🗑️ 名單已清空');
                
                // 通知 content script 更新
                chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
                    if (tabs[0] && tabs[0].url.includes('threads.net')) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            action: 'updateAccountList',
                            accounts: []
                        });
                    }
                });
            });
        }
    });
});