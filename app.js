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

// ⭐ 투자 알림 시스템 클래스
class InvestmentAlertSystem {
    constructor() {
        this.stocks = [
            { code: '005930', name: '삼성전자', reason: 'AI 반도체 수요 증가로 목표가 상향', price: 71500, change: 2.1 },
            { code: '000660', name: 'SK하이닉스', reason: '메모리 반도체 업사이클 본격 진입', price: 89300, change: 3.8 },
            { code: '035420', name: 'NAVER', reason: 'AI 기술 투자 확대 및 클라우드 성장', price: 184500, change: 1.7 },
            { code: '051910', name: 'LG화학', reason: '2차전지 소재 사업 확장', price: 432000, change: -0.5 },
            { code: '006400', name: '삼성SDI', reason: '전기차 배터리 수요 급증', price: 789000, change: 2.3 },
            { code: '373220', name: 'LG에너지솔루션', reason: '북미 배터리 공장 가동', price: 432000, change: -1.2 },
            { code: '207940', name: '삼성바이오로직스', reason: 'mRNA 백신 생산 계약 체결', price: 789000, change: 0.8 }
        ];
        
        this.volumeStocks = [
            { name: '삼성전자', volume: '15,423억원', change: 2.1 },
            { name: 'LG에너지솔루션', volume: '8,934억원', change: -1.2 },
            { name: '삼성바이오로직스', volume: '7,652억원', change: 0.8 },
            { name: 'SK하이닉스', volume: '6,234억원', change: 1.5 },
            { name: 'NAVER', volume: '5,123억원', change: 1.7 }
        ];
        
        this.init();
    }
    
    init() {
        this.requestNotificationPermission();
        this.setupAutoAlerts();
        this.displayCurrentData();
        this.createTestButtons();
    }
    
    // 알림 권한 요청
    async requestNotificationPermission() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('✅ 알림 권한 허용됨');
            } else {
                console.log('❌ 알림 권한 거부됨');
            }
        }
    }
    
    // 자동 알림 스케줄링
    setupAutoAlerts() {
        // 매분마다 시간 체크
        setInterval(() => {
            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();
            
            console.log(`현재 시간: ${hour}:${minute.toString().padStart(2, '0')}`);
            
            // 🌅 오전 8시 55분 - 추천종목 알림
            if (hour === 23 && minute === 45) {
                this.sendMorningAlert();
            }
            
            // 🌆 오후 3시 30분 - 거래대금 TOP3 알림 (장마감 후)
            if (hour === 15 && minute === 30) {
                this.sendEveningAlert();
            }
            
        }, 60000); // 1분마다 체크
        
        console.log('⏰ 자동 알림 스케줄 설정 완료 (오전 8:55, 오후 15:30)');
    }
    
    // 🎯 오전 추천종목 알림
    sendMorningAlert() {
        const recommendations = this.generateRecommendations();
        const message = `오늘의 AI 추천: ${recommendations.map(s => s.name).join(', ')}`;
        
        // 브라우저 알림
        if (Notification.permission === 'granted') {
            new Notification('🎯 오늘의 AI 추천종목', {
                body: message,
                icon: '/icon-192.png',
                tag: 'morning-stock'
            });
        }
        
        // 콘솔 로그
        console.log('🌅 오전 알림 발송:', message);
        
        // 화면 업데이트
        this.updateRecommendationsDisplay(recommendations);
        
        return { type: 'morning', recommendations, message };
    }
    
    // 💰 저녁 거래대금 알림
    sendEveningAlert() {
        const topVolume = this.getTopVolumeStocks();
        const message = `거래대금 1위: ${topVolume[0].name} (${topVolume[0].volume})`;
        
        // 브라우저 알림
        if (Notification.permission === 'granted') {
            new Notification('💰 거래대금 TOP3', {
                body: message,
                icon: '/icon-192.png',
                tag: 'evening-volume'
            });
        }
        
        // 콘솔 로그
        console.log('🌆 저녁 알림 발송:', message);
        
        // 화면 업데이트
        this.updateVolumeDisplay(topVolume);
        
        return { type: 'evening', topVolume, message };
    }
    
    // AI 추천종목 생성 (랜덤 3개)
    generateRecommendations() {
        const shuffled = [...this.stocks].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    }
    
    // 거래대금 TOP3 반환
    getTopVolumeStocks() {
        return this.volumeStocks.slice(0, 3);
    }
    
    // 화면에 추천종목 표시
    updateRecommendationsDisplay(recommendations) {
        const container = document.getElementById('recommendations');
        
        const html = recommendations.map(stock => `
            <div class="stock-item">
                <div class="stock-info">
                    <h3>${stock.name} (${stock.code})</h3>
                    <p>${stock.reason}</p>
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
    
    // 화면에 거래대금 표시
    updateVolumeDisplay(topStocks) {
        const container = document.getElementById('top-volume');
        
        const html = topStocks.map((stock, index) => `
            <div class="stock-item">
                <div class="stock-info">
                    <h3>${index + 1}위. ${stock.name}</h3>
                    <p>거래대금: ${stock.volume}</p>
                </div>
                <div class="stock-price">
                    <div class="change ${stock.change > 0 ? 'positive' : 'negative'}">
                        ${stock.change > 0 ? '+' : ''}${stock.change}%
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
    }
    
    // 초기 데이터 표시
    displayCurrentData() {
        const recommendations = this.generateRecommendations();
        const topVolume = this.getTopVolumeStocks();
        
        this.updateRecommendationsDisplay(recommendations);
        this.updateVolumeDisplay(topVolume);
    }
    
    // 🧪 테스트 버튼 생성
    createTestButtons() {
        // 오전 알림 테스트 버튼
        const morningBtn = document.createElement('button');
        morningBtn.textContent = '🌅 오전 알림 테스트';
        morningBtn.className = 'test-btn morning-btn';
        morningBtn.onclick = () => {
            const result = this.sendMorningAlert();
            alert(`오전 알림 테스트 완료!\n${result.message}`);
        };
        
        // 저녁 알림 테스트 버튼
        const eveningBtn = document.createElement('button');
        eveningBtn.textContent = '🌆 저녁 알림 테스트';
        eveningBtn.className = 'test-btn evening-btn';
        eveningBtn.onclick = () => {
            const result = this.sendEveningAlert();
            alert(`저녁 알림 테스트 완료!\n${result.message}`);
        };
        
        // 현재 시간 표시 버튼
        const timeBtn = document.createElement('button');
        timeBtn.textContent = '🕐 현재 시간';
        timeBtn.className = 'test-btn time-btn';
        timeBtn.onclick = () => {
            const now = new Date();
            const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
            alert(`현재 시간: ${timeStr}\n\n자동 알림 시간:\n• 오전 8:56 (추천종목)\n• 오후 15:30 (거래대금)`);
        };
        
        document.body.appendChild(morningBtn);
        document.body.appendChild(eveningBtn);
        document.body.appendChild(timeBtn);
    }
}

// 알림 설정 기능
function setupNotifications() {
    const morningAlarm = document.getElementById('morning-alarm');
    const eveningAlarm = document.getElementById('evening-alarm');
    
    // 설정 불러오기
    morningAlarm.checked = localStorage.getItem('morningAlarm') !== 'false';
    eveningAlarm.checked = localStorage.getItem('eveningAlarm') !== 'false';
    
    // 설정 저장
    morningAlarm.addEventListener('change', () => {
        localStorage.setItem('morningAlarm', morningAlarm.checked);
        console.log('오전 알림:', morningAlarm.checked ? '켜짐' : '꺼짐');
    });
    
    eveningAlarm.addEventListener('change', () => {
        localStorage.setItem('eveningAlarm', eveningAlarm.checked);
        console.log('저녁 알림:', eveningAlarm.checked ? '켜짐' : '꺼짐');
    });
}

// 🚀 앱 시작
document.addEventListener('DOMContentLoaded', () => {
    console.log('📈 AI 투자 알림 앱 시작!');
    
    // 투자 알림 시스템 시작
    const alertSystem = new InvestmentAlertSystem();
    
    // 알림 설정 초기화
    setupNotifications();
    
    console.log('✅ 모든 시스템 초기화 완료');
});