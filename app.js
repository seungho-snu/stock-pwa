// PWA 설치 관련
let deferredPrompt;
const installBtn = document.getElementById('install-btn');

// PWA 설치 프롬프트 이벤트
window.addEventListener('beforeinstallprompt', (e) => {
    console.log('PWA 설치 가능');
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = 'block';
});

// 설치 버튼 클릭
installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`설치 결과: ${outcome}`);
        deferredPrompt = null;
        installBtn.style.display = 'none';
    }
});

// 서비스 워커 등록
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js')
            .then((registration) => {
                console.log('SW 등록 성공:', registration.scope);
            })
            .catch((registrationError) => {
                console.log('SW 등록 실패:', registrationError);
            });
    });
}

// 푸시 알림 권한 요청
async function requestNotificationPermission() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    return false;
}

// 모의 주식 데이터 (실제로는 API에서 가져옴)
const stockData = {
    recommendations: [
        {
            code: '005930',
            name: '삼성전자',
            reason: 'AI 반도체 수요 증가로 인한 성장 전망',
            price: 71500,
            change: 2.1,
            targetPrice: 85000
        },
        {
            code: '000660',
            name: 'SK하이닉스',
            reason: '메모리 반도체 업사이클 진입',
            price: 89300,
            change: 3.8,
            targetPrice: 120000
        },
        {
            code: '035420',
            name: 'NAVER',
            reason: 'AI 기술 투자 확대 및 클라우드 성장',
            price: 184500,
            change: 1.7,
            targetPrice: 220000
        }
    ],
    topVolume: [
        {
            code: '005930',
            name: '삼성전자',
            price: 71500,
            change: 2.1,
            volume: '15,423억원'
        },
        {
            code: '373220',
            name: 'LG에너지솔루션',
            price: 432000,
            change: -1.2,
            volume: '8,934억원'
        },
        {
            code: '207940',
            name: '삼성바이오로직스',
            price: 789000,
            change: 0.8,
            volume: '7,652억원'
        }
    ]
};

// 추천 종목 표시
function displayRecommendations() {
    const container = document.getElementById('recommendations');
    
    const html = stockData.recommendations.map(stock => `
        <div class="stock-item">
            <div class="stock-info">
                <h3>${stock.name} (${stock.code})</h3>
                <p>${stock.reason}</p>
                <p>목표가: ${stock.targetPrice.toLocaleString()}원</p>
            </div>
            <div class="stock-price">
                <div class="price">${stock.price.toLocaleString()}원</div>
                <div class="change ${stock.change > 0 ? 'positive' : 'negative'}">
                    ${stock.change > 0 ? '+' : ''}${stock.change}%
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// 거래대금 TOP3 표시
function displayTopVolume() {
    const container = document.getElementById('top-volume');
    
    const html = stockData.topVolume.map((stock, index) => `
        <div class="stock-item">
            <div class="stock-info">
                <h3>${index + 1}위. ${stock.name} (${stock.code})</h3>
                <p>거래대금: ${stock.volume}</p>
            </div>
            <div class="stock-price">
                <div class="price">${stock.price.toLocaleString()}원</div>
                <div class="change ${stock.change > 0 ? 'positive' : 'negative'}">
                    ${stock.change > 0 ? '+' : ''}${stock.change}%
                </div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// 알림 설정
function setupNotifications() {
    const morningAlarm = document.getElementById('morning-alarm');
    const eveningAlarm = document.getElementById('evening-alarm');
    
    // 설정 불러오기
    morningAlarm.checked = localStorage.getItem('morningAlarm') === 'true';
    eveningAlarm.checked = localStorage.getItem('eveningAlarm') === 'true';
    
    // 설정 저장
    morningAlarm.addEventListener('change', () => {
        localStorage.setItem('morningAlarm', morningAlarm.checked);
        if (morningAlarm.checked) {
            scheduleNotification('morning');
        }
    });
    
    eveningAlarm.addEventListener('change', () => {
        localStorage.setItem('eveningAlarm', eveningAlarm.checked);
        if (eveningAlarm.checked) {
            scheduleNotification('evening');
        }
    });
}

// 알림 스케줄링 (실제로는 서버에서 처리)
function scheduleNotification(type) {
    console.log(`${type} 알림이 설정되었습니다.`);
    
    // 데모용 - 10초 후 알림
    setTimeout(() => {
        if (type === 'morning') {
            showNotification('🎯 오늘의 AI 추천종목', '삼성전자, SK하이닉스, NAVER를 확인하세요!');
        } else {
            showNotification('💰 거래대금 TOP3', '삼성전자가 1위를 차지했습니다!');
        }
    }, 10000);
}

// 알림 표시
function showNotification(title, body) {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, {
                body: body,
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                actions: [
                    { action: 'view', title: '확인하기' },
                    { action: 'close', title: '닫기' }
                ]
            });
        });
    }
}

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    displayRecommendations();
    displayTopVolume();
    setupNotifications();
    requestNotificationPermission();
});