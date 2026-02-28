// ==================== 클래스 정의 ====================

/**
 * Element 클래스
 * 화학 원소를 나타냅니다
 */
class Element {
    constructor(name, symbol, color) {
        this.name = name;        // 원소 이름 (예: "수소")
        this.symbol = symbol;    // 원소 기호 (예: "H")
        this.color = color;      // 색상 (그래디언트)
        this.discovered = false; // 해금 여부
        this.count = 0;          // 보유 개수
    }

    // HTML 요소 생성
    createElementNode() {
        const slot = document.createElement('div');
        slot.className = 'element-slot';
        slot.draggable = true;
        slot.dataset.element = this.symbol;

        const display = document.createElement('div');
        display.className = 'element-display';

        const circle = document.createElement('div');
        circle.className = `element-circle ${this.symbol.toLowerCase()}`;
        circle.textContent = this.symbol;

        const info = document.createElement('div');
        info.className = 'element-info';

        const name = document.createElement('div');
        name.className = 'element-name';
        name.textContent = this.name;

        const count = document.createElement('div');
        count.className = 'element-count';
        count.textContent = `x${this.count}`;

        display.appendChild(circle);
        display.appendChild(info);
        display.appendChild(name);
        slot.appendChild(display);
        slot.appendChild(count);

        return slot;
    }
}

/**
 * Compound 클래스
 * 화학 물질을 나타냅니다
 */
class Compound {
    constructor(name, formula, components, info, moneyPerSecond = 1) {
        this.name = name;             // 화학물질 이름 (예: "물")
        this.formula = formula;       // 분자식 (예: "H₂O")
        this.components = components; // 결합된 원소들 (예: {H: 2, O: 1})
        this.info = info;             // 화학물질 정보
        this.discovered = false;      // 해금 여부
        this.moneyPerSecond = moneyPerSecond; // 초당 벌리는 돈
    }

    // HTML 요소 생성
    createCompoundNode() {
        const item = document.createElement('div');
        item.className = 'compound-item';
        item.style.cursor = 'pointer';

        const itemName = document.createElement('div');
        itemName.className = 'compound-item-name';
        itemName.textContent = this.name;

        const itemFormula = document.createElement('div');
        itemFormula.className = 'compound-item-formula';
        itemFormula.textContent = this.formula;

        item.appendChild(itemName);
        item.appendChild(itemFormula);

        // 클릭 시 정보 표시
        item.addEventListener('click', () => {
            window.game.showCompoundInfo(this);
        });

        return item;
    }

    // 분자 시각화 생성
    createMoleculeVisualization() {
        const container = document.createElement('div');
        container.className = 'molecule-container';
        const molecule = document.createElement('div');
        molecule.className = 'molecule';

        // 간단한 분자 표현: 원자들을 원문 안에 표시
        if (this.formula === 'H₂O') {
            molecule.className += ' water';
            const oxygenAtom = document.createElement('div');
            oxygenAtom.className = 'atom oxygen';
            oxygenAtom.textContent = 'O';
            const hydrogenLeft = document.createElement('div');
            hydrogenLeft.className = 'atom hydrogen left';
            hydrogenLeft.textContent = 'H';
            const hydrogenRight = document.createElement('div');
            hydrogenRight.className = 'atom hydrogen right';
            hydrogenRight.textContent = 'H';
            const bondLeft = document.createElement('div');
            bondLeft.className = 'bond left';
            const bondRight = document.createElement('div');
            bondRight.className = 'bond right';
            molecule.appendChild(oxygenAtom);
            molecule.appendChild(hydrogenLeft);
            molecule.appendChild(hydrogenRight);
            molecule.appendChild(bondLeft);
            molecule.appendChild(bondRight);
        } else {
            // 다른 분자들: 간단한 원 안에 성분 표시
            molecule.style.width = '120px';
            molecule.style.height = '120px';
            molecule.style.borderRadius = '50%';
            molecule.style.background = `linear-gradient(135deg, hsl(${Math.random() * 360}, 70%, 50%), hsl(${Math.random() * 360}, 70%, 60%))`;
            molecule.style.display = 'flex';
            molecule.style.alignItems = 'center';
            molecule.style.justifyContent = 'center';
            molecule.style.fontSize = '20px';
            molecule.style.fontWeight = 'bold';
            molecule.style.color = 'white';
            molecule.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.4)';
            molecule.textContent = this.formula;
        }

        container.appendChild(molecule);
        return container;
    }
}

// ==================== 게임 로직 ====================

class Game {
    constructor() {
        this.elements = new Map();
        this.compounds = new Map();
        this.discoveredElements = new Set();
        this.discoveredCompounds = new Set();
        this.addedElements = [];  // 합성 중인 원소들
        this.collectedMolecules = [];  // 수집품: 최대 5개
        
        // 돈 시스템
        this.money = 0;
        this.moneyPerSecond = 0;
        // 기본 구매 가격 (원소별)
        this.defaultPurchasePrice = 5;
        
        // 원소 해금 조건 및 가격 (shop에서 구매 시)
        // target: 만들어야 할 분자와 그 개수
        this.elementUnlockConditions = {
            'C': { type: 'compounds', target: 'H₂O', count: 3, price: 25 },
            'N': { type: 'compounds', target: 'CO₂', count: 5, price: 50 },
            'Cl': { type: 'compounds', target: 'HCl', count: 3, price: 100 },
            'Na': { type: 'compounds', target: 'NaCl', count: 2, price: 200 },
            'K': { type: 'compounds', target: 'KCl', count: 2, price: 300 },
            'Ca': { type: 'compounds', target: 'CaCO₃', count: 1, price: 500 },
            'Fe': { type: 'compounds', target: 'Fe₂O₃', count: 1, price: 800 },
            'Mg': { type: 'compounds', target: 'MgO', count: 2, price: 1200 },
            'S': { type: 'compounds', target: 'SO₂', count: 3, price: 1500 },
            'P': { type: 'compounds', target: 'H₂SO₄', count: 1, price: 2000 },
            'Si': { type: 'compounds', target: 'SiO₂', count: 2, price: 2500 },
            'Al': { type: 'compounds', target: 'Al₂O₃', count: 1, price: 3000 },
            'F': { type: 'compounds', target: 'HF', count: 2, price: 4000 }
        };
        
        // 해금 가능한 상태의 원소들 (조건은 만족했지만 아직 클릭 안 함)
        this.elementUnlockReady = new Set();
        
        // 각 원소가 몇 개 생성되었는지 추적
        this.compoundsMadeCount = {};
        
        // 컬렉션 애니메이션 ID
        this.collectionAnimationId = null;
        
        // 합성 영역 애니메이션 ID
        this.synthesisAnimationId = null;
        
        // 합성 진행 중 플래그 (중복 클릭 방지)
        this.isSynthesizing = false;
        
        // 튜토리얼 상태 초기화
        this.tutorialActive = true;
        this.currentTutorialIndex = 0;
        this.tutorialSteps = [
            {
                desc: '1단계: H₂O(물)을 만들라',
                completed: false,
                check: () => {
                    const cmp = this.compounds.get('H₂O');
                    return cmp && cmp.discovered;
                }
            },
            {
                desc: '2단계: CO₂(이산화탄소)를 만들라',
                completed: false,
                check: () => {
                    const cmp = this.compounds.get('CO₂');
                    return cmp && cmp.discovered;
                }
            },
            {
                desc: '3단계: NH₃(암모니아)를 만들라',
                completed: false,
                check: () => {
                    const cmp = this.compounds.get('NH₃');
                    return cmp && cmp.discovered;
                }
            },
            {
                desc: '4단계: HCl(염화수소)를 만들라',
                completed: false,
                check: () => {
                    const cmp = this.compounds.get('HCl');
                    return cmp && cmp.discovered;
                }
            },
            {
                desc: '5단계: NaCl(소금)을 만들라',
                completed: false,
                check: () => {
                    const cmp = this.compounds.get('NaCl');
                    return cmp && cmp.discovered;
                }
            },
            {
                desc: '6단계: H₂SO₄(황산)을 만들라',
                completed: false,
                check: () => {
                    const cmp = this.compounds.get('H₂SO₄');
                    return cmp && cmp.discovered;
                }
            },
            {
                desc: '7단계: H₃PO₄(인산)을 만들라',
                completed: false,
                check: () => {
                    const cmp = this.compounds.get('H₃PO₄');
                    return cmp && cmp.discovered;
                }
            },
            {
                desc: '8단계: Fe₂O₃(산화철)을 만들라',
                completed: false,
                check: () => {
                    const cmp = this.compounds.get('Fe₂O₃');
                    return cmp && cmp.discovered;
                }
            },
            {
                desc: '9단계: CaCO₃(탄산칼슘)을 만들라',
                completed: false,
                check: () => {
                    const cmp = this.compounds.get('CaCO₃');
                    return cmp && cmp.discovered;
                }
            },
            {
                desc: '10단계: SiO₂(이산화규소)를 만들라',
                completed: false,
                check: () => {
                    const cmp = this.compounds.get('SiO₂');
                    return cmp && cmp.discovered;
                }
            },
            {
                desc: '11단계: Al₂O₃(산화알루미늄)을 만들라',
                completed: false,
                check: () => {
                    const cmp = this.compounds.get('Al₂O₃');
                    return cmp && cmp.discovered;
                }
            },
            {
                desc: '12단계: CF₄(테트라플루오로메탄)을 만들라',
                completed: false,
                check: () => {
                    const cmp = this.compounds.get('CF₄');
                    return cmp && cmp.discovered;
                }
            }
        ];
        
        this.initializeElements();
        this.initializeCompounds();
        this.setupEventListeners();
        this.setupModalListeners();
        this.setupIntroListeners();
        this.setupCollectionListeners();
        this.setupTabListeners();
        this.setupShopListeners();
        this.setupFeedbackOverlay();
        this.startMoneyGeneration();
        this.render();
    }

    /**
     * 초기 화면 리스너 설정
     */
    setupIntroListeners() {
        // Intro listeners are now handled in initGame() for better simplicity
        // This method is kept as a placeholder for consistency
    }

    /**
     * 수집품 화면 리스너 설정
     */
    setupCollectionListeners() {
        const collectionBtn = document.getElementById('collectionBtn');
        const backBtn = document.getElementById('backBtn');
        const collectionScreen = document.getElementById('collectionScreen');

        collectionBtn.addEventListener('click', () => {
            collectionScreen.classList.add('active');
            this.renderCollection();
            this.setupFurnaceListeners(); // 용광로 리스너 설정
        });

        backBtn.addEventListener('click', () => {
            collectionScreen.classList.remove('active');
        });
    }
    
    /**
     * 용광로 리스너 설정
     */
    setupFurnaceListeners() {
        const furnace = document.getElementById('furnace');
        let draggedMolecule = null;
        
        document.addEventListener('dragstart', (e) => {
            if (e.target.closest('.molecule-display')) {
                draggedMolecule = e.target.closest('.molecule-display');
                draggedMolecule.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            }
        });
        
        document.addEventListener('dragend', (e) => {
            if (draggedMolecule) {
                draggedMolecule.classList.remove('dragging');
                draggedMolecule = null;
            }
        });
        
        furnace.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            furnace.classList.add('dragover');
        });
        
        furnace.addEventListener('dragleave', () => {
            furnace.classList.remove('dragover');
        });
        
        furnace.addEventListener('drop', (e) => {
            e.preventDefault();
            furnace.classList.remove('dragover');
            
            if (draggedMolecule) {
                // 분자 분해
                this.decomposeMolecule(draggedMolecule);
            }
        });
    }
    
    /**
     * 분자 분해 기능
     */
    decomposeMolecule(moleculeDisplay) {
        // moleculeDisplay에는 dataset.key로 화합물 키가 저장되어 있음
        const moleculeKey = moleculeDisplay.dataset.key;
        if (!moleculeKey) return;

        // 찾을 수 있는 인덱스들을 찾아 가장 가까운(해당 요소에 해당하는 첫 인스턴스) 것을 제거
        const idx = this.collectedMolecules.lastIndexOf(moleculeKey);
        if (idx === -1) return;

        const compound = this.compounds.get(moleculeKey);
        if (!compound) return;

        // 분자의 컴포넌트 원소들을 인벤토리에 추가
        for (let symbol in compound.components) {
            const count = compound.components[symbol];
            const element = this.elements.get(symbol);
            if (element) element.count += count;
        }

        // 수집품 목록에서 해당 인덱스 제거
        this.collectedMolecules.splice(idx, 1);

        // UI 업데이트
        this.render();
        this.renderCollection();

        // 분해 애니메이션
        moleculeDisplay.style.animation = 'decompose 0.6s ease-out forwards';
    }

    /**
     * 탭 리스너 설정
     */
    setupTabListeners() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    /**
     * 탭 전환
     */
    switchTab(tabName) {
        // 모든 탭 버튼 비활성화
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 모든 화면 숨기기
        document.querySelectorAll('.screen-container').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // 선택된 탭 버튼 활성화
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        // 선택된 화면 표시
        document.getElementById(`${tabName}Screen`).classList.add('active');
        
        // 상점 화면이면 상점 렌더링
        if (tabName === 'shop') {
            this.renderShop();
        }
        
        // 레시피 화면이면 레시피 렌더링
        if (tabName === 'recipe') {
            this.renderRecipe();
        }
    }

    /**
     * 상점 리스너 설정
     */
    setupShopListeners() {
        const scrollLeftBtn = document.getElementById('shopScrollLeft');
        const scrollRightBtn = document.getElementById('shopScrollRight');
        const shopBoard = document.getElementById('shopBoard');
        
        scrollLeftBtn.addEventListener('click', () => {
            shopBoard.scrollBy({ left: -300, behavior: 'smooth' });
        });
        
        scrollRightBtn.addEventListener('click', () => {
            shopBoard.scrollBy({ left: 300, behavior: 'smooth' });
        });
    }

    /**
     * ESC 키를 눌렀을 때 저장 코드 오버레이를 토글하고
     * 코드 클릭 시 복사 기능을 설정합니다.
     */
    setupFeedbackOverlay() {
        const overlay = document.getElementById('codeOverlay');
        const codeElem = document.getElementById('generatedCode');
        if (!overlay || !codeElem) {
            console.warn('피드백 오버레이 요소를 찾을 수 없습니다');
            return;
        }

        // ESC 키 이벤트
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (overlay.classList.contains('active')) {
                    overlay.classList.remove('active');
                } else {
                    this.showCodeOverlay();
                }
            }
        });

        // 오버레이 바깥 클릭 시 닫기
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
            }
        });

        // 코드 클릭 시 복사
        codeElem.addEventListener('click', () => {
            const text = codeElem.textContent;
            if (!text) return;
            navigator.clipboard.writeText(text).then(() => {
                const original = text;
                codeElem.textContent = original + ' (복사됨)';
                setTimeout(() => {
                    codeElem.textContent = original;
                }, 1000);
            }).catch((err) => {
                console.error('복사 실패', err);
            });
        });
    }

    /**
     * 오버레이를 표시하고 최신 저장 코드를 갱신합니다.
     */
    showCodeOverlay() {
        const overlay = document.getElementById('codeOverlay');
        const codeElem = document.getElementById('generatedCode');
        if (!overlay || !codeElem) return;
        codeElem.textContent = this.generateSaveCode();
        overlay.classList.add('active');
    }

    /**
     * 현재 게임 상태(원소+분자+돈+미션)를 JSON으로 만들고 Base64로 암호화하여 저장 코드를 생성합니다.
     */
    generateSaveCode() {
        const gameState = {
            elements: {},
            molecules: this.collectedMolecules,
            money: this.money,
            moneyPerSecond: this.moneyPerSecond,
            tutorial: {
                currentIndex: this.currentTutorialIndex,
                steps: this.tutorialSteps.map(step => ({
                    desc: step.desc,
                    completed: step.completed
                }))
            }
        };
        
        // 원소 상태 저장
        for (let [sym, elem] of this.elements) {
            if (!elem) continue;
            gameState.elements[sym] = {
                discovered: elem.discovered,
                count: elem.count
            };
        }
        
        // JSON으로 변환 후 Base64로 인코딩
        const jsonString = JSON.stringify(gameState);
        const encoded = btoa(unescape(encodeURIComponent(jsonString)));
        
        // "CHEM-" 프리픽스 추가 (게임 코드임을 나타냄)
        return 'CHEM-' + encoded;
    }

    /**
     * 주어진 저장 코드를 디코딩하고 파싱하여 게임 상태를 복원합니다.
     */
    loadFromCode(code) {
        if (!code || typeof code !== 'string') return;
        
        try {
            // "CHEM-" 프리픽스 제거
            if (!code.startsWith('CHEM-')) {
                console.warn('⚠️ 유효하지 않은 코드 형식입니다.');
                return;
            }
            
            const encoded = code.substring(5); // "CHEM-" 제거
            const jsonString = decodeURIComponent(escape(atob(encoded)));
            const gameState = JSON.parse(jsonString);
            
            // 원소 상태 복원
            if (gameState.elements) {
                for (let sym in gameState.elements) {
                    const elem = this.elements.get(sym);
                    if (!elem) continue;
                    const state = gameState.elements[sym];
                    elem.discovered = state.discovered;
                    elem.count = state.count;
                    
                    if (elem.discovered) {
                        this.discoveredElements.add(sym);
                    } else {
                        this.discoveredElements.delete(sym);
                    }
                }
            }
            
            // 분자 상태 복원
            if (gameState.molecules && Array.isArray(gameState.molecules)) {
                this.collectedMolecules = gameState.molecules;
                // 분자의 discovered 상태도 복원
                gameState.molecules.forEach(moleculeKey => {
                    const compound = this.compounds.get(moleculeKey);
                    if (compound) {
                        compound.discovered = true;
                        this.discoveredCompounds.add(moleculeKey);
                    }
                });
            }
            
            // 돈 정보 복원
            if (typeof gameState.money === 'number') {
                this.money = gameState.money;
            }
            if (typeof gameState.moneyPerSecond === 'number') {
                this.moneyPerSecond = gameState.moneyPerSecond;
            }
            
            // 미션 정보 복원
            if (gameState.tutorial) {
                if (typeof gameState.tutorial.currentIndex === 'number') {
                    this.currentTutorialIndex = gameState.tutorial.currentIndex;
                }
                if (Array.isArray(gameState.tutorial.steps)) {
                    this.tutorialSteps.forEach((step, index) => {
                        if (gameState.tutorial.steps[index]) {
                            step.completed = gameState.tutorial.steps[index].completed;
                        }
                    });
                }
            }
            
            console.log('✓ 저장 코드 복원 완료 (원소 + 분자 + 돈 + 미션)');
            this.render();
        } catch (err) {
            console.error('❌ 저장 코드 복원 중 오류:', err);
            alert('저장 코드가 손상되었거나 유효하지 않습니다.');
        }
    }

    /**
     * 튜토리얼 바를 업데이트하여 현재 미션을 보여줍니다.
     */
    renderTutorialBar() {
        const bar = document.getElementById('tutorialBar');
        if (!bar) return;
        if (!this.tutorialActive || this.currentTutorialIndex >= this.tutorialSteps.length) {
            bar.textContent = '';
            bar.className = 'tutorial-bar';
            bar.onclick = null;
            return;
        }
        const step = this.tutorialSteps[this.currentTutorialIndex];
        bar.textContent = step.desc;
        bar.className = 'tutorial-bar' + (step.completed ? ' completed' : '');
        if (step.completed) {
            bar.style.cursor = 'pointer';
            bar.onclick = () => {
                if (step.completed) {
                    this.currentTutorialIndex++;
                    this.renderTutorialBar();
                }
            };
        } else {
            bar.style.cursor = 'default';
            bar.onclick = null;
        }
    }

    /**
     * 튜토리얼 상태를 체크하여 미션이 완료되었는지 확인합니다.
     */
    updateTutorial() {
        if (!this.tutorialActive) return;
        if (this.currentTutorialIndex >= this.tutorialSteps.length) return;
        const step = this.tutorialSteps[this.currentTutorialIndex];
        if (!step.completed && step.check()) {
            step.completed = true;
            this.renderTutorialBar();
        }
    }

    /**
     * 매초 돈 벌기
     */
    startMoneyGeneration() {
        setInterval(() => {
            this.money += this.moneyPerSecond;
            this.updateMoneyDisplay();
        }, 1000);
    }

    /**
     * 돈 표시 업데이트
     */
    updateMoneyDisplay() {
        document.getElementById('moneyAmount').textContent = Math.floor(this.money);
        document.getElementById('moneyPerSecond').textContent = `(+${this.moneyPerSecond}/s)`;
    }

    /**
     * 원소 구매
     */
    buyElement(symbol, price = 5) {
        const element = this.elements.get(symbol);
        
        if (this.money >= price) {
            this.money -= price;
            element.count += 1;
            this.updateMoneyDisplay();
            this.render();
            this.renderShop();
        } else {
            alert('돈이 부족합니다!');
        }
    }

    /**
     * 원소 초기화
     */
    initializeElements() {
        // 수소 (H) - 처음에 2개 보유
        const hydrogen = new Element('수소', 'H', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
        hydrogen.discovered = true;
        hydrogen.count = 2;
        hydrogen.purchasePrice = 5;
        this.elements.set('H', hydrogen);
        this.discoveredElements.add('H');

        // 산소 (O) - 처음에 1개 보유
        const oxygen = new Element('산소', 'O', 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)');
        oxygen.discovered = true;
        oxygen.count = 1;
        oxygen.purchasePrice = 5;
        this.elements.set('O', oxygen);
        this.discoveredElements.add('O');
        
        // 탄소 (C)
        const carbon = new Element('탄소', 'C', 'linear-gradient(135deg, #645995 0%, #2d2d44 100%)');
        carbon.discovered = false;
        carbon.count = 0;
        carbon.purchasePrice = 25;
        this.elements.set('C', carbon);

        // 질소 (N)
        const nitrogen = new Element('질소', 'N', 'linear-gradient(135deg, #3b4c8e 0%, #1e2a5f 100%)');
        nitrogen.discovered = false;
        nitrogen.count = 0;
        nitrogen.purchasePrice = 50;
        this.elements.set('N', nitrogen);

        // 염소 (Cl)
        const chlorine = new Element('염소', 'Cl', 'linear-gradient(135deg, #90ee90 0%, #228b22 100%)');
        chlorine.discovered = false;
        chlorine.count = 0;
        chlorine.purchasePrice = 100;
        this.elements.set('Cl', chlorine);

        // 나트륨 (Na)
        const sodium = new Element('나트륨', 'Na', 'linear-gradient(135deg, #ffd166 0%, #ff9f1c 100%)');
        sodium.discovered = false;
        sodium.count = 0;
        sodium.purchasePrice = 200;
        this.elements.set('Na', sodium);

        // 칼륨 (K)
        const potassium = new Element('칼륨', 'K', 'linear-gradient(135deg, #ffd6a5 0%, #ffb4a2 100%)');
        potassium.discovered = false;
        potassium.count = 0;
        potassium.purchasePrice = 300;
        this.elements.set('K', potassium);

        // 칼슘 (Ca)
        const calcium = new Element('칼슘', 'Ca', 'linear-gradient(135deg, #a3d9ff 0%, #7fbfff 100%)');
        calcium.discovered = false;
        calcium.count = 0;
        calcium.purchasePrice = 500;
        this.elements.set('Ca', calcium);

        // 철 (Fe)
        const iron = new Element('철', 'Fe', 'linear-gradient(135deg, #b0b0b0 0%, #6e6e6e 100%)');
        iron.discovered = false;
        iron.count = 0;
        iron.purchasePrice = 800;
        this.elements.set('Fe', iron);

        // 마그네슘 (Mg)
        const magnesium = new Element('마그네슘', 'Mg', 'linear-gradient(135deg, #cfeaff 0%, #9fd3ff 100%)');
        magnesium.discovered = false;
        magnesium.count = 0;
        magnesium.purchasePrice = 1200;
        this.elements.set('Mg', magnesium);

        // 황 (S)
        const sulfur = new Element('황', 'S', 'linear-gradient(135deg, #fff59d 0%, #ffd54f 100%)');
        sulfur.discovered = false;
        sulfur.count = 0;
        sulfur.purchasePrice = 1500;
        this.elements.set('S', sulfur);

        // 인 (P)
        const phosphorus = new Element('인', 'P', 'linear-gradient(135deg, #ffecb3 0%, #ffd54f 100%)');
        phosphorus.discovered = false;
        phosphorus.count = 0;
        phosphorus.purchasePrice = 2000;
        this.elements.set('P', phosphorus);

        // 규소 (Si)
        const silicon = new Element('규소', 'Si', 'linear-gradient(135deg, #d1c4e9 0%, #b39ddb 100%)');
        silicon.discovered = false;
        silicon.count = 0;
        silicon.purchasePrice = 2500;
        this.elements.set('Si', silicon);

        // 알루미늄 (Al)
        const aluminum = new Element('알루미늄', 'Al', 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)');
        aluminum.discovered = false;
        aluminum.count = 0;
        aluminum.purchasePrice = 3000;
        this.elements.set('Al', aluminum);

        // 플루오린 (F)
        const fluorine = new Element('플루오린', 'F', 'linear-gradient(135deg, #b2ebf2 0%, #80deea 100%)');
        fluorine.discovered = false;
        fluorine.count = 0;
        fluorine.purchasePrice = 4000;
        this.elements.set('F', fluorine);
    }

    /**
     * 화학물질 초기화
     */
    initializeCompounds() {
        // 기본 분자들 및 확장된 분자 목록 (사용자 제공 데이터 반영)
        const h2 = new Compound('수소 분자', 'H₂', { H: 2 }, '수소 분자입니다.', 1);
        this.compounds.set('H₂', h2);

        const o2 = new Compound('산소 분자', 'O₂', { O: 2 }, '산소 분자입니다.', 1);
        this.compounds.set('O₂', o2);

        const water = new Compound('물', 'H₂O', { H: 2, O: 1 }, '물은 생명의 근원입니다.', 1);
        this.compounds.set('H₂O', water);

        const h2o2 = new Compound('과산화수소', 'H₂O₂', { H: 2, O: 2 }, '과산화수소입니다.', 2);
        this.compounds.set('H₂O₂', h2o2);

        const co2 = new Compound('이산화탄소', 'CO₂', { C: 1, O: 2 }, '이산화탄소입니다.', 3);
        this.compounds.set('CO₂', co2);

        const ch4 = new Compound('메탄', 'CH₄', { C: 1, H: 4 }, '메탄입니다.', 2);
        this.compounds.set('CH₄', ch4);

        const c2h6 = new Compound('에탄', 'C₂H₆', { C: 2, H: 6 }, '에탄입니다.', 4);
        this.compounds.set('C₂H₆', c2h6);

        const c3h8 = new Compound('프로판', 'C₃H₈', { C: 3, H: 8 }, '프로판입니다.', 5);
        this.compounds.set('C₃H₈', c3h8);

        const c4h10 = new Compound('부탄', 'C₄H₁₀', { C: 4, H: 10 }, '부탄입니다.', 6);
        this.compounds.set('C₄H₁₀', c4h10);

        const c2o2 = new Compound('이산화탄소 변형', 'C₂O₂', { C: 2, O: 2 }, 'C₂O₂ 변형입니다.', 4);
        this.compounds.set('C₂O₂', c2o2);

        const c2n2 = new Compound('시안', 'C₂N₂', { C: 2, N: 2 }, '시안 계열입니다.', 5);
        this.compounds.set('C₂N₂', c2n2);

        const hcn = new Compound('청산', 'HCN', { H: 1, C: 1, N: 1 }, '청산입니다.', 6);
        this.compounds.set('HCN', hcn);

        const c2h4 = new Compound('에틸렌', 'C₂H₄', { C: 2, H: 4 }, '에틸렌입니다.', 4);
        this.compounds.set('C₂H₄', c2h4);

        // 질소 관련
        const n2 = new Compound('질소 분자', 'N₂', { N: 2 }, '질소 분자입니다.', 1);
        this.compounds.set('N₂', n2);

        const nh3 = new Compound('암모니아', 'NH₃', { N: 1, H: 3 }, '암모니아입니다.', 3);
        this.compounds.set('NH₃', nh3);

        const no = new Compound('일산화질소', 'NO', { N: 1, O: 1 }, '일산화질소입니다.', 2);
        this.compounds.set('NO', no);

        const no2 = new Compound('이산화질소', 'NO₂', { N: 1, O: 2 }, '이산화질소입니다.', 3);
        this.compounds.set('NO₂', no2);

        const n2o = new Compound('아산화질소', 'N₂O', { N: 2, O: 1 }, '아산화질소입니다.', 4);
        this.compounds.set('N₂O', n2o);

        const hno3 = new Compound('질산', 'HNO₃', { H: 1, N: 1, O: 3 }, '질산입니다.', 8);
        this.compounds.set('HNO₃', hno3);

        // 염소 관련
        const cl2 = new Compound('염소 분자', 'Cl₂', { Cl: 2 }, '염소 분자입니다.', 2);
        this.compounds.set('Cl₂', cl2);

        const hcl = new Compound('염화수소', 'HCl', { H: 1, Cl: 1 }, '염화수소입니다.', 4);
        this.compounds.set('HCl', hcl);

        // 나트륨/칼륨 관련
        const na2 = new Compound('나트륨 분자', 'Na₂', { Na: 2 }, '나트륨 분자입니다.', 2);
        this.compounds.set('Na₂', na2);

        const k2 = new Compound('칼륨 분자', 'K₂', { K: 2 }, '칼륨 분자입니다.', 2);
        this.compounds.set('K₂', k2);

        const nacl = new Compound('소금', 'NaCl', { Na: 1, Cl: 1 }, '식용 소금입니다.', 10);
        this.compounds.set('NaCl', nacl);

        const kcl = new Compound('염화칼륨', 'KCl', { K: 1, Cl: 1 }, '염화칼륨입니다.', 11);
        this.compounds.set('KCl', kcl);

        const naoh = new Compound('수산화나트륨', 'NaOH', { Na: 1, O: 1, H: 1 }, '수산화나트륨입니다.', 8);
        this.compounds.set('NaOH', naoh);

        const koh = new Compound('수산화칼륨', 'KOH', { K: 1, O: 1, H: 1 }, '수산화칼륨입니다.', 8);
        this.compounds.set('KOH', koh);

        const na2co3 = new Compound('탄산나트륨', 'Na₂CO₃', { Na: 2, C: 1, O: 3 }, '탄산나트륨입니다.', 12);
        this.compounds.set('Na₂CO₃', na2co3);

        const k2co3 = new Compound('탄산칼륨', 'K₂CO₃', { K: 2, C: 1, O: 3 }, '탄산칼륨입니다.', 12);
        this.compounds.set('K₂CO₃', k2co3);

        // 칼슘 관련
        const ca2 = new Compound('칼슘 분자', 'Ca₂', { Ca: 2 }, '칼슘 분자입니다.', 3);
        this.compounds.set('Ca₂', ca2);

        const caco3 = new Compound('탄산칼슘', 'CaCO₃', { Ca: 1, C: 1, O: 3 }, '탄산칼슘입니다.', 20);
        this.compounds.set('CaCO₃', caco3);

        const cahyd = new Compound('수산화칼슘', 'Ca(OH)₂', { Ca: 1, O: 2, H: 2 }, '수산화칼슘입니다.', 14);
        this.compounds.set('Ca(OH)₂', cahyd);

        const caso4 = new Compound('황산칼슘', 'CaSO₄', { Ca: 1, S: 1, O: 4 }, '황산칼슘입니다.', 18);
        this.compounds.set('CaSO₄', caso4);

        const caf2 = new Compound('불화칼슘', 'CaF₂', { Ca: 1, F: 2 }, '불화칼슘입니다.', 17);
        this.compounds.set('CaF₂', caf2);

        // 철 관련
        const fe2 = new Compound('철 분자', 'Fe₂', { Fe: 2 }, '철 분자입니다.', 4);
        this.compounds.set('Fe₂', fe2);

        const fe2o3 = new Compound('산화철', 'Fe₂O₃', { Fe: 2, O: 3 }, '산화철입니다.', 24);
        this.compounds.set('Fe₂O₃', fe2o3);

        const fes = new Compound('황화철', 'FeS', { Fe: 1, S: 1 }, '황화철입니다.', 20);
        this.compounds.set('FeS', fes);

        const fecl3 = new Compound('염화철(III)', 'FeCl₃', { Fe: 1, Cl: 3 }, '염화철(III)입니다.', 14);
        this.compounds.set('FeCl₃', fecl3);

        const fef3 = new Compound('불화철(III)', 'FeF₃', { Fe: 1, F: 3 }, '불화철(III)입니다.', 22);
        this.compounds.set('FeF₃', fef3);

        // 마그네슘 관련
        const mg2 = new Compound('마그네슘 분자', 'Mg₂', { Mg: 2 }, '마그네슘 분자입니다.', 4);
        this.compounds.set('Mg₂', mg2);

        const mgo = new Compound('산화마그네슘', 'MgO', { Mg: 1, O: 1 }, '산화마그네슘입니다.', 18);
        this.compounds.set('MgO', mgo);

        const mgcl2 = new Compound('염화마그네슘', 'MgCl₂', { Mg: 1, Cl: 2 }, '염화마그네슘입니다.', 13);
        this.compounds.set('MgCl₂', mgcl2);

        // 황 관련
        const s8 = new Compound('황 분자', 'S₈', { S: 8 }, '황 분자입니다.', 5);
        this.compounds.set('S₈', s8);

        const so2 = new Compound('아황산가스', 'SO₂', { S: 1, O: 2 }, '아황산가스입니다.', 16);
        this.compounds.set('SO₂', so2);

        const so3 = new Compound('삼산화황', 'SO₃', { S: 1, O: 3 }, '삼산화황입니다.', 18);
        this.compounds.set('SO₃', so3);

        const h2so4 = new Compound('황산', 'H₂SO₄', { H: 2, S: 1, O: 4 }, '황산입니다.', 40);
        this.compounds.set('H₂SO₄', h2so4);

        const h2s = new Compound('황화수소', 'H₂S', { H: 2, S: 1 }, '황화수소입니다.', 14);
        this.compounds.set('H₂S', h2s);

        // 인 관련
        const p4 = new Compound('인 분자', 'P₄', { P: 4 }, '인 분자입니다.', 6);
        this.compounds.set('P₄', p4);

        const ph3 = new Compound('포스핀', 'PH₃', { P: 1, H: 3 }, '포스핀입니다.', 20);
        this.compounds.set('PH₃', ph3);

        const p2o5 = new Compound('오산화인', 'P₂O₅', { P: 2, O: 5 }, '오산화인입니다.', 24);
        this.compounds.set('P₂O₅', p2o5);

        const h3po4 = new Compound('인산', 'H₃PO₄', { H: 3, P: 1, O: 4 }, '인산입니다.', 50);
        this.compounds.set('H₃PO₄', h3po4);

        // 규소 관련
        const si2 = new Compound('규소 분자', 'Si₂', { Si: 2 }, '규소 분자입니다.', 7);
        this.compounds.set('Si₂', si2);

        const sio2 = new Compound('이산화규소', 'SiO₂', { Si: 1, O: 2 }, '이산화규소입니다.', 30);
        this.compounds.set('SiO₂', sio2);

        const sih4 = new Compound('실란', 'SiH₄', { Si: 1, H: 4 }, '실란입니다.', 24);
        this.compounds.set('SiH₄', sih4);

        // 알루미늄 관련
        const al2 = new Compound('알루미늄 분자', 'Al₂', { Al: 2 }, '알루미늄 분자입니다.', 8);
        this.compounds.set('Al₂', al2);

        const al2o3 = new Compound('산화알루미늄', 'Al₂O₃', { Al: 2, O: 3 }, '산화알루미늄입니다.', 36);
        this.compounds.set('Al₂O₃', al2o3);

        const alcl3 = new Compound('염화알루미늄', 'AlCl₃', { Al: 1, Cl: 3 }, '염화알루미늄입니다.', 15);
        this.compounds.set('AlCl₃', alcl3);

        const alf3 = new Compound('불화알루미늄', 'AlF₃', { Al: 1, F: 3 }, '불화알루미늄입니다.', 26);
        this.compounds.set('AlF₃', alf3);

        // 플루오린 관련
        const f2 = new Compound('플루오린 분자', 'F₂', { F: 2 }, '플루오린 분자입니다.', 10);
        this.compounds.set('F₂', f2);

        const hf = new Compound('불화수소', 'HF', { H: 1, F: 1 }, '불화수소입니다.', 30);
        this.compounds.set('HF', hf);

        const cf4 = new Compound('테트라플루오로메탄', 'CF₄', { C: 1, F: 4 }, '테트라플루오로메탄입니다.', 40);
        this.compounds.set('CF₄', cf4);

        const naf = new Compound('불화나트륨', 'NaF', { Na: 1, F: 1 }, '불화나트륨입니다.', 14);
        this.compounds.set('NaF', naf);

        const kf = new Compound('불화칼륨', 'KF', { K: 1, F: 1 }, '불화칼륨입니다.', 14);
        this.compounds.set('KF', kf);
    }

    /**
     * 모달 리스너 설정
     */
    setupModalListeners() {
        const modalOverlay = document.getElementById('modalOverlay');
        const modalClose = document.getElementById('modalClose');

        modalClose.addEventListener('click', () => {
            modalOverlay.classList.remove('active');
        });

        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('active');
            }
        });
    }

    /**
     * 화학물질 정보 표시
     */
    showCompoundInfo(compound) {
        const modalOverlay = document.getElementById('modalOverlay');
        const modalTitle = document.getElementById('modalTitle');
        const modalFormula = document.getElementById('modalFormula');
        const modalInfo = document.getElementById('modalInfo');

        modalTitle.textContent = compound.name;
        modalFormula.textContent = compound.formula;
        
        // 동적으로 정보 생성 (모든 분자에 대해 초당 수익을 명시하는 새로운 문단 추가)
        let info = compound.info;
        modalInfo.innerHTML = `<strong>설명:</strong> ${info}`;
        modalInfo.innerHTML += `<p style="margin-top:10px;"><strong>수익:</strong> 이 분자는 초당 ${compound.moneyPerSecond}원을 벌어줍니다.</p>`;

        modalOverlay.classList.add('active');
    }

    /**
     * 이벤트 리스너 설정
     */
    setupEventListeners() {
        const synthesisContainer = document.getElementById('synthesisContainer');
        const synthesisBtn = document.getElementById('synthesisBtn');
        let draggedElement = null;
        let draggedSymbol = null;

        // 드래그 시작
        document.addEventListener('dragstart', (e) => {
            if (e.target.closest('.element-slot')) {
                draggedElement = e.target.closest('.element-slot');
                draggedSymbol = draggedElement.dataset.element;
                draggedElement.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', draggedSymbol);
            }
        });

        // 드래그 끝
        document.addEventListener('dragend', (e) => {
            if (draggedElement) {
                draggedElement.classList.remove('dragging');
                draggedElement = null;
                draggedSymbol = null;
            }
        });

        // 드래그 오버
        synthesisContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            synthesisContainer.classList.add('dragover');
        });

        // 드래그 떠나기
        synthesisContainer.addEventListener('dragleave', () => {
            synthesisContainer.classList.remove('dragover');
        });

        // 드롭
        synthesisContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            synthesisContainer.classList.remove('dragover');

            const elementSymbol = e.dataTransfer.getData('text/plain');
            
            if (elementSymbol) {
                console.log(`${elementSymbol} 드롭됨`);
                this.handleElementDrop(elementSymbol);
            }
        });

        // 합성 버튼 클릭
        synthesisBtn.addEventListener('click', () => {
            if (this.addedElements.length > 0 && !this.isSynthesizing) {
                this.isSynthesizing = true;
                this.performSynthesisAnimation();
                // 합성 완료 후 플래그 해제 (3초 후)
                setTimeout(() => {
                    this.isSynthesizing = false;
                }, 3000);
            }
        });
    }

    /**
     * 원소 드롭 처리
     */
    handleElementDrop(elementSymbol) {
        const element = this.elements.get(elementSymbol);
        const resultDisplay = document.getElementById('resultDisplay');

        // 원소가 1개 이상 있는지 확인
        if (!element || element.count <= 0) {
            resultDisplay.innerHTML = `<div class="result-text">❌ ${elementSymbol}가 부족합니다!</div>`;
            setTimeout(() => {
                resultDisplay.innerHTML = '';
            }, 2000);
            return;
        }

        // 원소 추가
        this.addedElements.push(elementSymbol);
        element.count -= 1;  // 개수 즉시 감소!

        console.log(`${elementSymbol} 추가됨. 현재 조합: ${this.addedElements.join(', ')}`);
        
        this.render();
        this.updateSynthesisPreview();
    }

    /**
     * 특정 화합물을 만들 수 있는지 확인
     */
    canMakeCompound(compound) {
        // 현재 추가된 원소들의 개수 계산
        const addedCount = {};
        this.addedElements.forEach(symbol => {
            addedCount[symbol] = (addedCount[symbol] || 0) + 1;
        });

        // compound에 필요한 모든 원소가 정확히 있는지 확인
        for (let symbol in compound.components) {
            if ((addedCount[symbol] || 0) !== compound.components[symbol]) {
                return false;
            }
        }
        
        // 추가 원소가 없는지 확인 (정확히 매치되어야 함)
        for (let symbol in addedCount) {
            if (!compound.components[symbol]) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * 합성 가능한 화학물질 찾기 (데이터 기반)
     * @returns {Compound|null} 만들 수 있는 compound 또는 null
     */
    findMakableCompound() {
        for (let [key, compound] of this.compounds) {
            if (this.canMakeCompound(compound)) {
                return compound;
            }
        }
        return null;
    }

    /**
     * 합성 영역 원소 애니메이션 (자유 이동 + 벽 반사)
     */
    startAddedElementsAnimation(container) {
        // 이전 애니메이션 중지
        if (this.synthesisAnimationId) {
            cancelAnimationFrame(this.synthesisAnimationId);
        }
        
        const animate = () => {
            const elements = container.querySelectorAll('.added-element');
            const containerWidth = container.offsetWidth;
            const containerHeight = container.offsetHeight;
            const elementSize = 60; // .added-element 크기
            
            elements.forEach(el => {
                let x = parseFloat(el.dataset.x);
                let y = parseFloat(el.dataset.y);
                let vx = parseFloat(el.dataset.vx);
                let vy = parseFloat(el.dataset.vy);
                
                // 위치 업데이트
                x += vx;
                y += vy;
                
                // 경계선 반사
                if (x <= 0 || x >= containerWidth - elementSize) {
                    vx = -vx;
                }
                if (y <= 0 || y >= containerHeight - elementSize) {
                    vy = -vy;
                }
                
                // 범위 제한
                x = Math.max(0, Math.min(x, containerWidth - elementSize));
                y = Math.max(0, Math.min(y, containerHeight - elementSize));
                
                el.dataset.x = x;
                el.dataset.y = y;
                el.dataset.vx = vx;
                el.dataset.vy = vy;
                el.style.left = x + 'px';
                el.style.top = y + 'px';
            });
            
            this.synthesisAnimationId = requestAnimationFrame(animate);
        };
        
        animate();
    }

    /**
     * 합성 미리보기 업데이트
     */
    updateSynthesisPreview() {
        const synthesisArea = document.getElementById('synthesisArea');
        let previewDisplay = synthesisArea.querySelector('.synthesis-preview');
        
        if (!previewDisplay) {
            previewDisplay = document.createElement('div');
            previewDisplay.className = 'synthesis-preview';
            // Insert after synthesis-controls
            const controls = synthesisArea.querySelector('.synthesis-controls');
            if (controls) {
                controls.parentNode.insertBefore(previewDisplay, controls.nextSibling);
            } else {
                synthesisArea.appendChild(previewDisplay);
            }
        }
        
        if (this.addedElements.length === 0) {
            previewDisplay.innerHTML = '';
            return;
        }
        
        const makable = this.findMakableCompound();
        if (makable) {
            previewDisplay.innerHTML = `<div class="preview-content">⬇️ 만들어질 분자: <strong>${makable.name}</strong> (${makable.formula})</div>`;
            previewDisplay.style.color = '#00ff00';
        } else {
            previewDisplay.innerHTML = `<div class="preview-content">⬇️ 만들어질 분자: ❌</div>`;
            previewDisplay.style.color = '#ff6666';
        }
    }

    /**
     * 합성 애니메이션 실행
     */
    performSynthesisAnimation() {
        // 만들 수 있는 화학물질 확인
        const makableCompound = this.findMakableCompound();
        if (!makableCompound) {
            // 폭발 애니메이션
            const synthesisContainer = document.getElementById('synthesisContainer');
            const elements = synthesisContainer.querySelectorAll('.added-element');
            const resultDisplay = document.getElementById('resultDisplay');
            
            // 각 원소에 폭발 애니메이션 실행
            elements.forEach((el, index) => {
                const angle = (index * 360 / elements.length) * (Math.PI / 180);
                const distance = 250;
                const offsetX = Math.cos(angle) * distance;
                const offsetY = Math.sin(angle) * distance;
                
                el.style.setProperty('--x', `-${offsetX}px`);
                el.style.setProperty('--y', `-${offsetY}px`);
                el.style.animation = `explosion 0.8s ease-out forwards`;
                el.style.animationDelay = `${index * 0.05}s`;
            });
            
            // 폭발 메시지
            resultDisplay.innerHTML = `<div class="result-text explosion-message">💥 합성 정보가 안맞습니다!</div>`;
            
            // 폭발이 끝난 후 원소 복구
            setTimeout(() => {
                // 드롭된 원소들의 개수를 복구
                this.addedElements.forEach(symbol => {
                    const element = this.elements.get(symbol);
                    element.count += 1;
                });
                this.addedElements = [];
                resultDisplay.innerHTML = '';
                this.render();
            }, 1000);
            
            return;
        }

        const synthesisContainer = document.getElementById('synthesisContainer');
        const elements = synthesisContainer.querySelectorAll('.added-element');
        
        // 각 원소에 대해 가운데로 모이는 애니메이션 실행
        elements.forEach((el, index) => {
            const rect = el.getBoundingClientRect();
            const centerX = window.innerWidth / 2;
            const centerY = synthesisContainer.offsetTop + synthesisContainer.offsetHeight / 2;
            
            // 현재 위치에서 가운데까지의 거리 계산
            const offsetX = centerX - rect.left - rect.width / 2;
            const offsetY = centerY - rect.top - rect.height / 2;
            
            el.style.setProperty('--x', `-${offsetX}px`);
            el.style.setProperty('--y', `-${offsetY}px`);
            el.style.animation = `merge-to-center 1s ease-in forwards`;
            el.style.animationDelay = `${index * 0.1}s`;
        });

        // 1초 후 합성 실행
        setTimeout(() => {
            this.attemptSynthesis();
        }, 1000);
    }

    /**
     * 화학물질 합성 실행
     */
    attemptSynthesis() {
        const resultDisplay = document.getElementById('resultDisplay');
        
        // 만들 수 있는 화학물질 찾기
        const compound = this.findMakableCompound();
        if (!compound) {
            // 이 경우는 정상적으로는 발생하지 않음 (performSynthesisAnimation에서 체크)
            return;
        }
        
        console.log(`[합성성공] ${compound.name} (${compound.formula}) 생성!`);
        
        // 처음 발견하는 경우
        const isFirstDiscovery = !compound.discovered;
        if (isFirstDiscovery) {
            compound.discovered = true;
            this.discoveredCompounds.add(compound.formula);
            console.log(`[처음발견] ${compound.name} (${compound.formula})`);
        }
        
        // 해당 화합물 생성 카운트 증가
        this.compoundsMadeCount[compound.formula] = (this.compoundsMadeCount[compound.formula] || 0) + 1;
        console.log(`[생성카운트] ${compound.formula}: ${this.compoundsMadeCount[compound.formula]}개`);
        
        // 원소 해금 조건 확인
        this.checkElementUnlocks();
        
        // 매초 버는 돈 속도 증가 (분자별로 다른 금액)
        this.moneyPerSecond += compound.moneyPerSecond;
        this.updateMoneyDisplay();
        
        // 수집품에 추가 (최대 5개)
        // 수집품 보관함: 전체는 최대 100개, 같은 종류는 최대 3개
        const existingCount = this.collectedMolecules.filter(k => k === compound.formula).length;
        if (this.collectedMolecules.length >= 100) {
            const resultDisplay = document.getElementById('resultDisplay');
            resultDisplay.innerHTML = `<div class="result-text">⚠️ 보관함이 가득 찼습니다 (최대 100개).</div>`;
            setTimeout(() => { resultDisplay.innerHTML = ''; }, 2000);
        } else if (existingCount < 3) {
            this.collectedMolecules.push(compound.formula);
        } else {
            const resultDisplay = document.getElementById('resultDisplay');
            resultDisplay.innerHTML = `<div class="result-text">⚠️ 보관함에 같은 분자가 이미 3개 있습니다.</div>`;
            setTimeout(() => { resultDisplay.innerHTML = ''; }, 2000);
        }
        
        // 처음 발견했을 때만 분자 시각화 표시
        if (isFirstDiscovery) {
            const moleculeViz = compound.createMoleculeVisualization();
            resultDisplay.innerHTML = '';
            resultDisplay.appendChild(moleculeViz);
        } else {
            resultDisplay.innerHTML = `<div class="result-text">✨ ${compound.name} 생성 완료!</div>`;
        }
        
        // 처음 발견하면 정보 모달 표시
        if (isFirstDiscovery) {
            setTimeout(() => {
                this.showCompoundInfo(compound);
            }, 500);
        }

        // ★ 핵심 수정: 합성이 완료되면 즉시 합성소를 완전히 비움
        this.addedElements = [];
        this.render();
        
        // 2초 후 결과 메시지만 지움
        setTimeout(() => {
            resultDisplay.innerHTML = '';
        }, 2000);
    }
    
    /**
     * 원소 해금 조건 확인 (해금 가능 상태만 표시)
     */
    checkElementUnlocks() {
        for (let symbol in this.elementUnlockConditions) {
            // 이미 해금되었으면 스킵
            if (this.elements.get(symbol).discovered) {
                continue;
            }
            
            // 이미 해금 가능 상태면 스킵
            if (this.elementUnlockReady.has(symbol)) {
                continue;
            }
            
            const condition = this.elementUnlockConditions[symbol];
            const madeCount = this.compoundsMadeCount[condition.target] || 0;
            
            console.log(`[해금체크] ${symbol}: ${condition.target} ${madeCount}개/${condition.count}개`);
            
            if (madeCount >= condition.count) {
                // 해금 가능 상태로 마크
                this.elementUnlockReady.add(symbol);
                console.log(`[해금준비] ${symbol} - ${condition.target} 조건 달성!`);
            }
        }
        // Update recipe tab alert badge when unlocks change
        this.updateRecipeTabAlert();
    }

    /**
     * 레시피 탭의 느낌표(알림) 갱신
     */
    updateRecipeTabAlert() {
        const recipeBtn = document.querySelector('.tab-btn[data-tab="recipe"]');
        if (!recipeBtn) return;
        // show alert if any unlock-ready element exists
        if (this.elementUnlockReady.size > 0) {
            recipeBtn.classList.add('tab-alert');
        } else {
            recipeBtn.classList.remove('tab-alert');
        }
    }
    
    /**
     * 원소 실제 해금 (레시피에서 클릭 시)
     */
    unlockElement(symbol) {
        if (this.elements.get(symbol).discovered) {
            return; // 이미 해금됨
        }
        
        if (!this.elementUnlockReady.has(symbol)) {
            return; // 아직 해금 조건을 만족하지 않음
        }
        
        // 원소 해금!
        const element = this.elements.get(symbol);
        element.discovered = true;
        this.discoveredElements.add(symbol);
        this.elementUnlockReady.delete(symbol);
        
        // 해금 메시지 표시
        alert(`🎉 새로운 원소 "${element.name}"(${symbol})이(가) 해금되었습니다!`);
        
        // UI 업데이트
        this.render();
        this.renderShop();
        this.renderRecipe();
    }

    /**
     * 합성 초기화
     */
    resetSynthesis() {
        const resultDisplay = document.getElementById('resultDisplay');
        this.addedElements = [];
        resultDisplay.innerHTML = '';
        this.render();
    }

    /**
     * UI 렌더링
     */
    render() {
        // 튜토리얼 진행 상태 먼저 갱신
        this.updateTutorial();
        this.renderTutorialBar();
        // 해금한 원소 개수 업데이트
        document.getElementById('discoveredCount').textContent = this.discoveredElements.size;
        document.getElementById('totalCount').textContent = this.elements.size;

        // 원소 인벤토리 렌더링
        const elementInventory = document.getElementById('elementInventory');
        elementInventory.innerHTML = '';
        this.elements.forEach((element, symbol) => {
            if (element.discovered) {
                const node = element.createElementNode();
                elementInventory.appendChild(node);
                // 클릭(터치)로 원소를 합성 슬롯에 추가 (모바일 대응)
                node.addEventListener('click', () => {
                    if (element.count > 0) {
                        this.addedElements.push(symbol);
                        element.count -= 1;
                        this.render();
                    } else {
                        const resultDisplay = document.getElementById('resultDisplay');
                        resultDisplay.innerHTML = `<div class="result-text">❌ ${symbol}가 부족합니다!</div>`;
                        setTimeout(() => { resultDisplay.innerHTML = ''; }, 1500);
                    }
                });
            }
        });

        // 합성 컨테이너에 추가된 원소들 렌더링
        const synthesisContainer = document.getElementById('synthesisContainer');
        synthesisContainer.innerHTML = '';
        
        this.addedElements.forEach((symbol, index) => {
            const addedElement = document.createElement('div');
            addedElement.className = `added-element ${symbol.toLowerCase()}`;
            addedElement.textContent = symbol;
            addedElement.dataset.index = index;
            
            // 플로팅 애니메이션 딜레이 추가
            addedElement.style.animationDelay = `${index * 0.2}s`;
            
            // 위치 데이터 추가 (자유 이동용)
            addedElement.dataset.x = Math.random() * (synthesisContainer.offsetWidth - 60);
            addedElement.dataset.y = Math.random() * (synthesisContainer.offsetHeight - 60);
            addedElement.dataset.vx = (Math.random() - 0.5) * 4;
            addedElement.dataset.vy = (Math.random() - 0.5) * 4;
            
            addedElement.style.position = 'absolute';
            addedElement.style.left = addedElement.dataset.x + 'px';
            addedElement.style.top = addedElement.dataset.y + 'px';
            
            addedElement.addEventListener('click', () => {
                // 원소 개수 복구
                this.elements.get(symbol).count += 1;
                // 추가된 원소 제거
                this.addedElements.splice(index, 1);
                this.render();
            });
            
            synthesisContainer.appendChild(addedElement);
        });
        
        // 원소 애니메이션 시작
        if (this.addedElements.length > 0) {
            this.startAddedElementsAnimation(synthesisContainer);
        }

        // 해금된 화학물질 리스트 렌더링
        const compoundList = document.getElementById('compoundList');
        compoundList.innerHTML = '';
        this.compounds.forEach((compound, key) => {
            if (compound.discovered) {
                compoundList.appendChild(compound.createCompoundNode());
            }
        });

        // 해금된 화학물질이 없으면 메시지 표시
        if (this.discoveredCompounds.size === 0) {
            const message = document.createElement('div');
            message.style.color = 'rgba(200, 200, 200, 0.6)';
            message.style.textAlign = 'center';
            message.style.padding = '20px';
            message.style.fontSize = '14px';
            message.textContent = '아직 해금된 화학물질이 없습니다';
            compoundList.appendChild(message);
        }
        // 업데이트: 레시피 탭 알림 갱신
        this.updateRecipeTabAlert();
        
        // 합성 미리보기 업데이트
        this.updateSynthesisPreview();
    }

    /**
     * 수집품 화면 렌더링
     */
    renderCollection() {
        const collectionDisplay = document.getElementById('collectionDisplay');
        collectionDisplay.innerHTML = '';

        // 최대 5개까지만 표시
        const displayCount = Math.min(this.collectedMolecules.length, 5);
        
        // 확정된 크기 설정 (화면 경계 고정)
        const containerWidth = 1100;
        const containerHeight = 650;
        
        collectionDisplay.style.position = 'relative';
        collectionDisplay.style.width = containerWidth + 'px';
        collectionDisplay.style.height = containerHeight + 'px';
        collectionDisplay.style.margin = '0 auto';
        
        for (let i = 0; i < displayCount; i++) {
            const key = this.collectedMolecules[this.collectedMolecules.length - 1 - i];
            const compound = this.compounds.get(key);
            const moleculeDisplay = document.createElement('div');
            moleculeDisplay.className = 'molecule-display';
            moleculeDisplay.dataset.key = key;
            moleculeDisplay.dataset.x = Math.random() * (containerWidth - 180);
            moleculeDisplay.dataset.y = Math.random() * (containerHeight - 180);
            moleculeDisplay.dataset.vx = (Math.random() - 0.5) * 3;
            moleculeDisplay.dataset.vy = (Math.random() - 0.5) * 3;
            moleculeDisplay.style.left = moleculeDisplay.dataset.x + 'px';
            moleculeDisplay.style.top = moleculeDisplay.dataset.y + 'px';
            moleculeDisplay.style.width = '180px';
            moleculeDisplay.style.height = '180px';
            moleculeDisplay.style.animation = 'none';
            moleculeDisplay.style.cursor = 'grab';
            
            // 분자 시각화 추가
            const moleculeViz = compound.createMoleculeVisualization();
            moleculeDisplay.appendChild(moleculeViz);
            
            // Pointer-based dragging for mouse & touch
            let isPointerDown = false;
            let startX = 0, startY = 0;
            let origX = parseFloat(moleculeDisplay.dataset.x);
            let origY = parseFloat(moleculeDisplay.dataset.y);
            const molWidth = 180, molHeight = 180;

            moleculeDisplay.addEventListener('pointerdown', (e) => {
                isPointerDown = true;
                moleculeDisplay.setPointerCapture(e.pointerId);
                moleculeDisplay.classList.add('dragging');
                moleculeDisplay.dataset.dragging = 'true';
                moleculeDisplay.style.transition = 'none';
                moleculeDisplay.style.cursor = 'grabbing';
                startX = e.clientX;
                startY = e.clientY;
                origX = parseFloat(moleculeDisplay.dataset.x);
                origY = parseFloat(moleculeDisplay.dataset.y);
                moleculeDisplay.style.zIndex = 2000;
            }, true);

            moleculeDisplay.addEventListener('pointermove', (e) => {
                if (!isPointerDown) return;
                const containerRect = collectionDisplay.getBoundingClientRect();
                // center under pointer
                const x = e.clientX - containerRect.left - molWidth / 2;
                const y = e.clientY - containerRect.top - molHeight / 2;
                moleculeDisplay.style.left = x + 'px';
                moleculeDisplay.style.top = y + 'px';
                // update dataset so animation loop (if running) uses current pos when released
                moleculeDisplay.dataset.x = x;
                moleculeDisplay.dataset.y = y;
            });

            moleculeDisplay.addEventListener('pointerup', (e) => {
                if (!isPointerDown) return;
                isPointerDown = false;
                moleculeDisplay.releasePointerCapture(e.pointerId);
                moleculeDisplay.classList.remove('dragging');
                moleculeDisplay.dataset.dragging = 'false';
                moleculeDisplay.style.zIndex = '';
                moleculeDisplay.style.transition = '';

                const clientX = e.clientX;
                const clientY = e.clientY;
                const furnace = document.getElementById('furnace');
                const furnaceRect = furnace.getBoundingClientRect();
                const mainContainer = document.querySelector('.container');
                const mainRect = mainContainer.getBoundingClientRect();

                // if dropped into furnace area -> decompose
                if (clientX >= furnaceRect.left && clientX <= furnaceRect.right && clientY >= furnaceRect.top && clientY <= furnaceRect.bottom) {
                    this.decomposeMolecule(moleculeDisplay);
                    return;
                }

                // if pointer is outside main container -> revert to original
                if (clientX < mainRect.left || clientX > mainRect.right || clientY < mainRect.top || clientY > mainRect.bottom) {
                    moleculeDisplay.style.left = origX + 'px';
                    moleculeDisplay.style.top = origY + 'px';
                    moleculeDisplay.dataset.x = origX;
                    moleculeDisplay.dataset.y = origY;
                } else {
                    // update to new position relative to collectionDisplay
                    const containerRect = collectionDisplay.getBoundingClientRect();
                    const newX = parseFloat(moleculeDisplay.style.left);
                    const newY = parseFloat(moleculeDisplay.style.top);
                    moleculeDisplay.dataset.x = Math.max(0, Math.min(newX, containerWidth - molWidth));
                    moleculeDisplay.dataset.y = Math.max(0, Math.min(newY, containerHeight - molHeight));
                }
            });
            
            collectionDisplay.appendChild(moleculeDisplay);
        }

        // 애니메이션 시작
        if (displayCount > 0) {
            this.animateCollection(collectionDisplay, containerWidth, containerHeight);
        }

        // 해금된 화학물질이 없으면 메시지 표시
        if (this.collectedMolecules.length === 0) {
            const message = document.createElement('div');
            message.style.color = 'rgba(200, 200, 200, 0.6)';
            message.style.textAlign = 'center';
            message.style.position = 'absolute';
            message.style.top = '50%';
            message.style.left = '50%';
            message.style.transform = 'translate(-50%, -50%)';
            message.style.fontSize = '20px';
            message.textContent = '아직 해금된 화학물질이 없습니다';
            collectionDisplay.appendChild(message);
        }
    }

    /**
     * 수집품 컬렉션 애니메이션 (경계선 반사)
     */
    animateCollection(container, maxWidth, maxHeight) {
        // 이전 애니메이션이 있으면 중지
        if (this.collectionAnimationId) {
            cancelAnimationFrame(this.collectionAnimationId);
        }
        
        const molecules = container.querySelectorAll('.molecule-display');
        const molSize = 180;  // 분자 크기
        
        const animate = () => {
            molecules.forEach(mol => {
                // skip molecules currently being dragged by the user
                if (mol.dataset.dragging === 'true') return;
                let x = parseFloat(mol.dataset.x);
                let y = parseFloat(mol.dataset.y);
                let vx = parseFloat(mol.dataset.vx);
                let vy = parseFloat(mol.dataset.vy);
                
                // 위치 업데이트
                x += vx;
                y += vy;
                
                // 경계선 반사
                if (x <= 0 || x >= maxWidth - molSize) vx = -vx;
                if (y <= 0 || y >= maxHeight - molSize) vy = -vy;
                
                // 범위 제한
                x = Math.max(0, Math.min(x, maxWidth - molSize));
                y = Math.max(0, Math.min(y, maxHeight - molSize));
                
                mol.dataset.x = x;
                mol.dataset.y = y;
                mol.dataset.vx = vx;
                mol.dataset.vy = vy;
                mol.style.left = x + 'px';
                mol.style.top = y + 'px';
            });
            
            this.collectionAnimationId = requestAnimationFrame(animate);
        };
        
        animate();
    }

    /**
     * 상점 화면 렌더링
     */
    renderShop() {
        const shopBoard = document.getElementById('shopBoard');
        shopBoard.innerHTML = '';

        // 모든 원소 데이터 (가격은 해금 조건에서 가져옴)
        const allElements = [
            { symbol: 'H', name: '수소' },
            { symbol: 'O', name: '산소' },
            { symbol: 'C', name: '탄소' },
            { symbol: 'N', name: '질소' },
            { symbol: 'Cl', name: '염소' },
        ];

        // 해금된 원소만 판매
        allElements.forEach(item => {
            const element = this.elements.get(item.symbol);
            if (!element.discovered) {
                return; // 해금되지 않은 원소는 표시하지 않음
            }
            
            // 가격 설정: element.purchasePrice 우선, 없으면 기본값
            const price = element.purchasePrice || this.defaultPurchasePrice;
            
            const card = document.createElement('div');
            card.className = 'shop-card';

            const elementCircle = document.createElement('div');
            elementCircle.className = `element-circle ${item.symbol.toLowerCase()}`;
            elementCircle.textContent = item.symbol;

            const itemName = document.createElement('div');
            itemName.className = 'shop-card-name';
            itemName.textContent = item.name;

            const itemPrice = document.createElement('div');
            itemPrice.className = 'shop-card-price';
            itemPrice.textContent = `${price}원`;

            const buyBtn = document.createElement('button');
            buyBtn.className = 'shop-buy-btn';
            buyBtn.textContent = '구매';
            buyBtn.addEventListener('click', () => {
                this.buyElement(item.symbol, price);
            });

            card.appendChild(elementCircle);
            card.appendChild(itemName);
            card.appendChild(itemPrice);
            card.appendChild(buyBtn);

            shopBoard.appendChild(card);
        });

        // 나머지 빈 카드들 (?)
        const discoveredCount = Array.from(this.elements.values()).filter(e => e.discovered).length;
        const emptyCardCount = Math.max(0, 5 - discoveredCount);
        
        for (let i = 0; i < emptyCardCount; i++) {
            const card = document.createElement('div');
            card.className = 'shop-card shop-card-empty';

            const emptyContent = document.createElement('div');
            emptyContent.className = 'shop-card-empty-content';
            emptyContent.textContent = '?';

            card.appendChild(emptyContent);
            shopBoard.appendChild(card);
        }
    }

    /**
     * 레시피 화면 렌더링
     */
    renderRecipe() {
        const recipeBoard = document.getElementById('recipeBoard');
        recipeBoard.innerHTML = '';

        // Create two columns: left = element unlocks, right = compound recipes
        const cols = document.createElement('div');
        cols.className = 'recipe-columns';

        const leftCol = document.createElement('div');
        leftCol.className = 'recipe-column left';

        const rightCol = document.createElement('div');
        rightCol.className = 'recipe-column right';

        // Header labels
        const leftHeader = document.createElement('h3');
        leftHeader.textContent = '원소 해금';
        leftHeader.style.color = '#00ffff';
        leftHeader.style.margin = '0 0 10px 0';

        const rightHeader = document.createElement('h3');
        rightHeader.textContent = '분자 레시피';
        rightHeader.style.color = '#00ffff';
        rightHeader.style.margin = '0 0 10px 0';

        leftCol.appendChild(leftHeader);
        rightCol.appendChild(rightHeader);

        // grid containers for cards (max 4 columns)
        const leftGrid = document.createElement('div');
        leftGrid.className = 'recipe-grid';
        const rightGrid = document.createElement('div');
        rightGrid.className = 'recipe-grid';

        // 원소 해금 카드들
        for (let symbol in this.elementUnlockConditions) {
            const condition = this.elementUnlockConditions[symbol];
            const element = this.elements.get(symbol);
            const isReady = this.elementUnlockReady.has(symbol);
            const isUnlocked = element.discovered;

            const card = document.createElement('div');
            card.className = 'recipe-card';

            const elementCircle = document.createElement('div');
            elementCircle.className = `element-circle ${symbol.toLowerCase()}`;
            elementCircle.textContent = symbol;

            const name = document.createElement('div');
            name.className = 'recipe-item-name';
            name.textContent = element.name;

            const cond = document.createElement('div');
            cond.className = 'recipe-condition';
            cond.textContent = isUnlocked ? '✓ 해금됨' : `${condition.target} ${condition.count}개 시 해금`;

            if (isReady && !isUnlocked) {
                card.classList.add('recipe-card-ready');
                const exclamation = document.createElement('div');
                exclamation.className = 'recipe-exclamation';
                exclamation.textContent = '!';
                card.appendChild(exclamation);
                card.addEventListener('click', () => this.unlockElement(symbol));
            }

            card.appendChild(elementCircle);
            card.appendChild(name);
            card.appendChild(cond);
            leftGrid.appendChild(card);
        }

        // 분자 레시피 카드들 (오른쪽)
        for (let [key, compound] of this.compounds) {
            const card = document.createElement('div');
            card.className = 'recipe-card';
            
            // 현재 추가된 원소들로 만들 수 있는지 확인
            const canMake = this.canMakeCompound(compound);
            if (canMake) {
                card.classList.add('recipe-card-makable');
                card.style.backgroundColor = 'rgba(144, 238, 144, 0.3)'; // 연한 초록색
                card.style.borderColor = '#90ee90';
                card.style.boxShadow = '0 0 15px rgba(144, 238, 144, 0.5)';
            }

            const compoundName = document.createElement('div');
            compoundName.className = 'recipe-compound-name';
            compoundName.textContent = compound.name;

            const formula = document.createElement('div');
            formula.className = 'recipe-formula';
            formula.textContent = compound.formula;

            const components = document.createElement('div');
            components.className = 'recipe-components';
            let componentText = '';
            for (let symbol in compound.components) {
                const count = compound.components[symbol];
                componentText += `${symbol}×${count} + `;
            }
            componentText = componentText.slice(0, -3);
            components.textContent = componentText;

            card.appendChild(compoundName);
            card.appendChild(formula);
            card.appendChild(components);

            rightGrid.appendChild(card);
        }
        leftCol.appendChild(leftGrid);
        rightCol.appendChild(rightGrid);
        cols.appendChild(leftCol);
        cols.appendChild(rightCol);
        recipeBoard.appendChild(cols);

        // Mobile: add toggle buttons to switch views if narrow
        if (window.innerWidth <= 768) {
            const toggleBar = document.createElement('div');
            toggleBar.className = 'mobile-recipe-toggle';
            const btnLeft = document.createElement('button');
            btnLeft.textContent = '원소';
            const btnRight = document.createElement('button');
            btnRight.textContent = '분자';
            btnLeft.className = 'mobile-toggle active';
            btnRight.className = 'mobile-toggle';
            toggleBar.appendChild(btnLeft);
            toggleBar.appendChild(btnRight);
            recipeBoard.insertBefore(toggleBar, recipeBoard.firstChild);

            // by default show left (elements)
            rightCol.style.display = 'none';

            btnLeft.addEventListener('click', () => {
                leftCol.style.display = '';
                rightCol.style.display = 'none';
                btnLeft.classList.add('active');
                btnRight.classList.remove('active');
            });
            btnRight.addEventListener('click', () => {
                leftCol.style.display = 'none';
                rightCol.style.display = '';
                btnRight.classList.add('active');
                btnLeft.classList.remove('active');
            });
        }

        // Update recipe tab alert badge
        this.updateRecipeTabAlert();
    }
}

// ==================== 게임 시작 ====================

// DOM이 준비되면 게임 시작 리스너 설정
function initGame() {
    const startBtn = document.getElementById('startBtn');
    const introScreen = document.getElementById('introScreen');
    const loadInput = document.getElementById('loadCodeInput');
    
    if (!startBtn) {
        console.error('startBtn을 찾을 수 없습니다');
        return;
    }
    
    // 간단한 시작 버튼 클릭 핸들러
    startBtn.addEventListener('click', () => {
        // 게임 인스턴스 생성
        window.game = new Game();
        
        // 저장 코드가 있으면 로드
        if (loadInput && loadInput.value) {
            try {
                window.game.loadFromCode(loadInput.value.trim());
            } catch (err) {
                console.warn('저장 코드 로드 실패:', err);
            }
        }
        
        // 인트로 화면 숨기기
        if (introScreen) {
            introScreen.classList.remove('active');
        }
        
        console.log('게임 시작됨');
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initGame();
    });
} else {
    // DOM이 이미 준비됨
    initGame();
}
