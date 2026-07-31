console.log('Setting page script starting');

const engineNames = { 'DB': 'JavDB', 'Bus': 'JavBus', 'Miss': 'Miss' };

function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 1500);
    }
}

function updateProxyUI(enabled) {
    const toggle = document.getElementById('proxyToggle');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');

    if (toggle) toggle.checked = enabled;
    if (statusDot) {
        if (enabled) {
            statusDot.classList.add('active');
        } else {
            statusDot.classList.remove('active');
        }
    }
    if (statusText) {
        statusText.textContent = enabled ? '已开启' : '已关闭';
    }
}

function renderProxySitesList(sites) {
    const listEl = document.getElementById('proxySitesList');
    if (!listEl) return;

    if (!sites || sites.length === 0) {
        listEl.innerHTML = '<div class="proxy-sites-empty">暂无网站，请添加</div>';
        return;
    }

    listEl.innerHTML = sites.map((site, index) => `
        <div class="proxy-site-item">
            <span>${site}</span>
            <button data-index="${index}">&times;</button>
        </div>
    `).join('');

    listEl.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            removeProxySite(index);
        });
    });
}

function extractRootDomain(hostname) {
    const parts = hostname.split('.');
    if (parts.length > 2) {
        return parts.slice(-2).join('.');
    }
    return hostname;
}

function addProxySite() {
    const input = document.getElementById('proxySiteInput');
    const addBtn = document.getElementById('addProxySiteBtn');
    if (!input || !addBtn) return;

    let site = input.value.trim().toLowerCase();
    if (!site) return;

    site = site.replace(/^https?:\/\//, '').replace(/\/.*$/, '');

    if (!site) return;

    site = extractRootDomain(site);

    chrome.storage.local.get('proxySites', (data) => {
        let sites = data.proxySites || [];
        if (!sites.includes(site)) {
            sites.push(site);
            chrome.storage.local.set({ proxySites: sites }, () => {
                renderProxySitesList(sites);
                input.value = '';
                updateAddButtonState();
                showToast('已添加: ' + site);
                updateProxy();
            });
        } else {
            showToast('网站已存在');
        }
    });
}

function updateAddButtonState() {
    const input = document.getElementById('proxySiteInput');
    const addBtn = document.getElementById('addProxySiteBtn');
    if (!input || !addBtn) return;

    let site = input.value.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    if (!site) {
        addBtn.disabled = true;
        addBtn.style.opacity = '0.5';
        return;
    }

    site = extractRootDomain(site);

    chrome.storage.local.get('proxySites', (data) => {
        const sites = data.proxySites || [];
        if (sites.includes(site)) {
            addBtn.disabled = true;
            addBtn.style.opacity = '0.5';
        } else {
            addBtn.disabled = false;
            addBtn.style.opacity = '1';
        }
    });
}

function removeProxySite(index) {
    chrome.storage.local.get('proxySites', (data) => {
        let sites = data.proxySites || [];
        const removed = sites.splice(index, 1)[0];
        chrome.storage.local.set({ proxySites: sites }, () => {
            renderProxySitesList(sites);
            showToast('已移除: ' + removed);
            updateProxy();
        });
    });
}

function updateProxy() {
    chrome.storage.local.get(['proxyEnabled', 'proxySites'], (data) => {
        chrome.runtime.sendMessage({
            topic: 'setProxy',
            message: {
                enabled: data.proxyEnabled || false,
                sites: data.proxySites || []
            }
        });
    });
}

function init() {
    console.log('Init called');

    // 加载检索引擎设置
    chrome.storage.local.get('searcher', (data) => {
        const value = data && data.searcher ? data.searcher : 'DB';
        console.log('Loaded searcher:', value);

        document.querySelectorAll('.engine-card').forEach(card => {
            card.classList.remove('selected');
            if (card.dataset.engine === value) {
                card.classList.add('selected');
            }
        });
    });

    // 加载代理状态
    chrome.storage.local.get('proxyEnabled', (data) => {
        const enabled = data.proxyEnabled || false;
        console.log('Loaded proxy status:', enabled);
        updateProxyUI(enabled);
    });

    // 加载代理网站列表
    chrome.storage.local.get('proxySites', (data) => {
        renderProxySitesList(data.proxySites || []);
    });

    // 检索引擎点击事件
    document.querySelectorAll('.engine-card').forEach(card => {
        card.addEventListener('click', () => {
            const engine = card.dataset.engine;
            console.log('Card clicked:', engine);

            if (card.classList.contains('selected')) return;

            document.querySelectorAll('.engine-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            card.classList.add('pulse');
            setTimeout(() => card.classList.remove('pulse'), 300);

            chrome.storage.local.set({ searcher: engine }, () => {
                console.log('Saved:', engine);
                showToast('已切换到 ' + engineNames[engine]);
            });
        });
    });

    // 代理开关事件
    const proxyToggle = document.getElementById('proxyToggle');
    if (proxyToggle) {
        proxyToggle.addEventListener('change', function() {
            const enabled = this.checked;
            console.log('Proxy toggle changed:', enabled);

            updateProxyUI(enabled);

            chrome.storage.local.get('proxySites', (data) => {
                chrome.runtime.sendMessage({
                    topic: 'setProxy',
                    message: {
                        enabled: enabled,
                        sites: data.proxySites || []
                    }
                }, (response) => {
                    if (response && response.success) {
                        showToast(enabled ? '代理已开启' : '代理已关闭');
                    }
                });
            });
        });
    }

    // 添加代理网站
    const addBtn = document.getElementById('addProxySiteBtn');
    const siteInput = document.getElementById('proxySiteInput');
    if (addBtn) {
        addBtn.addEventListener('click', addProxySite);
    }
    if (siteInput) {
        siteInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addProxySite();
            }
        });
        siteInput.addEventListener('input', updateAddButtonState);
    }

    // 填充当前访问网站的域名
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url) {
            try {
                const url = new URL(tabs[0].url);
                if (url.hostname) {
                    siteInput.value = url.hostname;
                    updateAddButtonState();
                }
            } catch (e) {}
        }
    });

    // 填充当前访问网站的域名
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0] && tabs[0].url) {
            try {
                const url = new URL(tabs[0].url);
                if (url.hostname) {
                    siteInput.value = url.hostname;
                }
            } catch (e) {}
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
