function activeSpred(){
    setBodyHeight();
    layoutResize();
    modalLayoutResize();
    /****************테스트용 함수(반영X)****************/
}
// ==================css 변수 선언==================
function setBodyHeight(){ // vh 단위 대응
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', vh + 'px');
}
function layoutResize(){ // 페이지 하단 여백
    // 페이지 - 푸터높이
    let footer = document.querySelector('.footer');
    if(footer){
        let height = footer.offsetHeight;

        document.documentElement.style.setProperty('--layout-btm-height', height + 'px');
    }
    // 페이지 - 헤더높이
    let header = document.querySelector('.container > .content > .header');
    if(header){
        let height = header.offsetHeight;

        document.documentElement.style.setProperty('--layout-header-height', height + 'px');
    }
}
function modalLayoutResize(){
    // 모달 - 푸터높이
    let mdHeader = document.querySelector('.modal-header');
    if(mdHeader){
        let height = mdHeader.offsetHeight;

        document.documentElement.style.setProperty('--modal-header', height + 'px');
    }
    // 모달 - 헤더높이
    let mdFooter = document.querySelector('.modal-footer');
    if(mdFooter){
        let height = mdFooter.offsetHeight;

        document.documentElement.style.setProperty('--modal-footer', height + 'px');
    }
}
// ==================개별함수==================
function modeChange(teamName){
    if(teamName === 'none'){
        document.body.className = '';
    }
    else{
        document.body.className = teamName;
    }
}
// ====================== 모달 ======================
let focusHandler = null;

function openModal(modalId){
    let modal = document.getElementById(modalId);

    modal.triggerElement = document.activeElement;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';

    modal.dispatchEvent(new CustomEvent('modal.shown'));

    // ========== 접근성 ==========
    let focusableEl = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');

    if(focusableEl.length > 0){
        let firstEl = focusableEl[0];
        let lastEl = focusableEl[focusableEl.length - 1];

        requestAnimationFrame(function(){
            if(modal.classList.contains('show')){
                firstEl.focus();
            }
        });
        focusHandler = function(e){
            if(e.key !== 'Tab') return;
            if(e.shiftKey){
                if(document.activeElement === firstEl){
                    e.preventDefault();
                    lastEl.focus();
                }
            }
            if(document.activeElement === lastEl){
                e.preventDefault();
                firstEl.focus();
            }
        };
        modal.addEventListener('keydown', focusHandler);
    }
    if(typeof modalLayoutResize === 'function'){
        modalLayoutResize();
    }
}
function dismissModal(modalId){
    let modal = document.getElementById(modalId);

    modal.classList.remove('show');
    document.body.style.overflow = '';

    if(modal.triggerElement) modal.triggerElement.focus();
    if(focusHandler){
        modal.removeEventListener('keydown', focusHandler);
        focusHandler = null;
    }
    if(modal.triggerElement){
        modal.triggerElement.focus();
        delete modal.triggerElement;
    }
}
// ====================== 달력 바텀시트 그리기 ======================
function initCalendar(modalId){
    let modal = document.getElementById(modalId);

    // 요소 가져오기
    let showDateBtn = document.getElementById('showDate');
    let displayDateSpan = document.getElementById('displayDate');
    let calendarBody = document.getElementById('calendarBody');
    let calendarTit = document.getElementById('calendarTit');
    let prevBtn = document.getElementById('prevMonth');
    let nextBtn = document.getElementById('nextMonth');
    let confirmBtn = document.getElementById('confirmBtn'); // [오타수정] confirnBtn -> confirmBtn

    // 닫기 버튼 (HTML에 onclick="dismissModal"이 있어도, JS 제어가 필요할 수 있으므로 유지)
    let closeModalBtn = modal.querySelector('[onclick*="dismissModal"]');

    let currentDate = new Date();
    let selectedDate = new Date();

    // [달력 렌더링 함수]
    function renderCalendar(){
        let year = currentDate.getFullYear();
        let month = currentDate.getMonth();

        calendarTit.textContent = `${year}년 ${String(month + 1).padStart(2, '0')}월`;

        let firstDay = new Date(year, month, 1).getDay();
        let lastDate = new Date(year, month + 1, 0).getDate();

        let html = '';
        let dayCount = 1;
        let isMonthEnded = false;

        for(let i = 0; i < 6; i++){
            if(isMonthEnded && i > 0) break;
            let rowHtml = '<tr>';
            for(let j = 0; j < 7; j++){
                if((i === 0 && j < firstDay) || dayCount > lastDate){
                    rowHtml += '<td></td>';
                    if(dayCount > lastDate) isMonthEnded = true;
                } else {
                    let isToday = isSameDay(new Date(year, month, dayCount), new Date());
                    let isSelected = isSameDay(new Date(year, month, dayCount), selectedDate);

                    rowHtml += `<td><button type="button" class="date-btn ${isToday ? 'today' : ''}" aria-selected="${isSelected ? 'true' : 'false'}" data-day="${dayCount}" aria-label="${year}년 ${month + 1}월 ${dayCount}일">${dayCount}</button></td>`;
                    dayCount++;
                }
            }
            rowHtml += '</tr>';
            if(!isMonthEnded || (rowHtml.includes('date-btn'))){
                html += rowHtml;
            }
        }
        calendarBody.innerHTML = html;
        addDateClickEvents();
    }

    function isSameDay(d1, d2){
        return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
    }

    function addDateClickEvents() {
        const buttons = calendarBody.querySelectorAll('.date-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const day = parseInt(e.target.dataset.day);
                // 날짜 선택 시 selectedDate 업데이트
                selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                renderCalendar(); // 선택 효과(색상) 반영을 위해 다시 그리기
            });
        });
    }

    // [핵심 추가] 모달이 열릴 때('modal.shown') 실행될 로직
    modal.addEventListener('modal.shown', function(){
        // 모달 열릴 때, '선택된 날짜'가 있는 달을 보여주기 위해 currentDate 재설정
        currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
        renderCalendar(); // 달력 그리기 실행!
    });

    // 이벤트 핸들러들
    if(confirmBtn){ // 존재 여부 체크 습관화
        confirmBtn.addEventListener('click', function(){
            const y = selectedDate.getFullYear();
            const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
            const d = String(selectedDate.getDate()).padStart(2, '0');

            displayDateSpan.textContent = `${y}.${m}.${d}`;
            if(showDateBtn) showDateBtn.classList.add('is-value');

            dismissModal(modalId);
        });
    }

    if(closeModalBtn){
        closeModalBtn.addEventListener('click', function(){
            dismissModal(modalId);
        });
    }

    if(prevBtn){
        prevBtn.addEventListener('click', function (){
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if(nextBtn){
        nextBtn.addEventListener('click', function(){
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }
}

window.addEventListener('load', activeSpred);
window.addEventListener('resize', activeSpred);
document.addEventListener('DOMContentLoaded', function(){
    const calendarEl = document.getElementById('calendarBody');

    if(calendarEl){
        const parentModal = calendarEl.closest('.btm-sheet');
        if(parentModal){
            initCalendar(parentModal.id);
        }
    }
})

// ===========스크롤 요소 감지 스크립트 : 퍼블용 / 개발X
// document.addEventListener('scroll', function(event) {
//     const target = event.target;
//
//     // document 자체가 스크롤 되는 경우 (페이지 전체 스크롤)
//     if (target === document) {
//         console.log('🌐 페이지 전체(Document/Window)가 스크롤 중입니다.');
//     }
//     // 특정 요소(div, section 등)가 스크롤 되는 경우
//     else {
//         console.log('📦 특정 요소가 스크롤 중입니다:', target);
//         console.log(`   👉 태그: <${target.tagName}>, ID: #${target.id}, 클래스: .${target.className}`);
//     }
// }, true);

// =========탭 감지 스크립트 : 퍼블용/개발X
// window.addEventListener('keydown', (event) => {
//     // Tab 키가 눌렸는지 확인 (Shift + Tab 포함)
//     if (event.key === 'Tab') {
//         // 브라우저가 포커스를 이동시킨 직후의 요소를 확인하기 위해 setTimeout 사용
//         setTimeout(() => {
//             console.log(`태그명: ${document.activeElement.tagName} | 클래스: ${document.activeElement.className} | ID: ${document.activeElement.id}`);
//         }, 0);
//     }
// });