// Sistema de Pagamento Free Fire - Limpo e Funcional
class PaymentSystem {
    constructor() {
        this.selectedDiamondOption = '1998'; // Padrão: R$ 19,98
        this.selectedPaymentMethod = 'pix'; // PIX é o único método disponível
        this.isGeneratingPix = false; // Flag para evitar chamadas duplicadas
        
        this.diamondOptions = {
            '1998': { price: 1998, bonus: 1120, diamonds: 5200 },
            '4998': { price: 4998, bonus: 2800, diamonds: 13000 },
            '9998': { price: 9998, bonus: 5600, diamonds: 26000 },
            '19998': { price: 19998, bonus: 11200, diamonds: 52000 }
        };
        
        this.init();
    }
    
    init() {
        console.log('🚀 Inicializando sistema de pagamento...');
        
        this.setupEventListeners();
        this.selectDefaultOptions();
        this.updateSummary();
        this.setupGlobalFunctions();
        
        // Força aplicação da seleção visual com múltiplos delays para garantir que tudo carregou
        setTimeout(() => {
            console.log('🔄 Forçando aplicação da seleção visual (1º delay)...');
            this.updateSelectionVisual();
        }, 100);
        
        setTimeout(() => {
            console.log('🔄 Forçando aplicação da seleção visual (2º delay)...');
            this.updateSelectionVisual();
        }, 500);
        
        setTimeout(() => {
            console.log('🔄 Forçando aplicação da seleção visual (3º delay)...');
            this.updateSelectionVisual();
        }, 1000);
    }
    
    setupEventListeners() {
        console.log('🔄 Configurando event listeners...');
        
        // Event listeners para opções de diamantes
        const diamondOptions = document.querySelectorAll('input[name="diamondOption"]');
        console.log('Encontrados', diamondOptions.length, 'opções de diamantes');
        
        diamondOptions.forEach(radio => {
            radio.addEventListener('change', (e) => {
                console.log('🎯 Opção selecionada:', e.target.value);
                this.selectedDiamondOption = e.target.value;
                this.updateSummary();
                this.updateSelectionVisual();
                
                // Facebook Pixel - AddToCart Event
                if (typeof fbq !== 'undefined') {
                    const option = this.diamondOptions[e.target.value];
                    if (option) {
                        fbq('track', 'AddToCart', {
                            value: option.price,
                            currency: 'BRL',
                            content_name: `Diamantes Free Fire - ${option.diamonds.toLocaleString()} diamantes`,
                            content_category: 'Games',
                            content_type: 'product'
                        });
                        console.log('✅ Facebook Pixel: AddToCart event tracked');
                    }
                }
                
                // UTMify Pixel - AddToCart Event
                if (typeof window.utmifyPixel !== 'undefined') {
                    const option = this.diamondOptions[e.target.value];
                    if (option) {
                        window.utmifyPixel.track('add_to_cart', {
                            value: option.price,
                            currency: 'BRL'
                        });
                        console.log('✅ UTMify Pixel: AddToCart event tracked');
                    }
                }
            });
            
            // Adiciona também listener de clique para garantir
            const label = document.querySelector(`label[for="${radio.id}"]`);
            if (label) {
                label.addEventListener('click', (e) => {
                    console.log('🖱️ Label clicada para:', radio.value);
                    radio.checked = true;
                    this.selectedDiamondOption = radio.value;
                    this.updateSummary();
                    this.updateSelectionVisual();
                    
                    // Facebook Pixel - AddToCart Event (também no clique)
                    if (typeof fbq !== 'undefined') {
                        const option = this.diamondOptions[radio.value];
                        if (option) {
                            fbq('track', 'AddToCart', {
                                value: option.price,
                                currency: 'BRL',
                                content_name: `Diamantes Free Fire - ${option.diamonds.toLocaleString()} diamantes`,
                                content_category: 'Games',
                                content_type: 'product'
                            });
                            console.log('✅ Facebook Pixel: AddToCart event tracked (click)');
                        }
                    }
                    
                    // UTMify Pixel - AddToCart Event (também no clique)
                    if (typeof window.utmifyPixel !== 'undefined') {
                        const option = this.diamondOptions[radio.value];
                        if (option) {
                            window.utmifyPixel.track('add_to_cart', {
                                value: option.price,
                                currency: 'BRL'
                            });
                            console.log('✅ UTMify Pixel: AddToCart event tracked (click)');
                        }
                    }
                });
            }
        });
        
        // Event listener para botão "Compre agora"
        const buyButton = document.querySelector('#compreAgoraBtn');
        if (buyButton) {
            buyButton.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Facebook Pixel - Button Click Event
                if (typeof fbq !== 'undefined') {
                    fbq('track', 'CustomEvent', {
                        event_name: 'button_click',
                        button_name: 'compre_agora',
                        content_name: 'Diamantes Free Fire',
                        content_category: 'Games'
                    });
                    console.log('✅ Facebook Pixel: Button click event tracked');
                }
                
                // UTMify Pixel - Button Click Event
                if (typeof window.utmifyPixel !== 'undefined') {
                    window.utmifyPixel.track('button_click', {
                        button_name: 'compre_agora',
                        content_name: 'Diamantes Free Fire'
                    });
                    console.log('✅ UTMify Pixel: Button click event tracked');
                }
                
                this.openPixPayment();
            });
        }
        
        // Event listener para método de pagamento PIX
        const pixRadio = document.querySelector('input[name="paymentMethod"][value="pix"]');
        if (pixRadio) {
            pixRadio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectPixMethod();
                }
            });
        }
    }
    
    selectDefaultOptions() {
        console.log('🔄 Selecionando opções padrão...');
        
        // Seleciona a primeira opção de diamante por padrão
        const firstDiamondOption = document.querySelector('input[name="diamondOption"]');
        if (firstDiamondOption) {
            firstDiamondOption.checked = true;
            this.selectedDiamondOption = firstDiamondOption.value;
            console.log('✅ Primeira opção selecionada:', this.selectedDiamondOption);
        } else {
            console.error('❌ Nenhuma opção de diamante encontrada');
        }
        
        // PIX já está selecionado por padrão no HTML
        this.selectedPaymentMethod = 'pix';
        
        // Aplica seleção visual inicial com delay para garantir que o DOM está pronto
        setTimeout(() => {
            this.updateSelectionVisual();
            this.selectPixMethod();
        }, 100);
    }
    
    updateSummary() {
        const option = this.diamondOptions[this.selectedDiamondOption];
        if (!option) return;
        
        // Atualiza o bônus
        const bonusElement = document.querySelector('.whitespace-nowrap');
        if (bonusElement) {
            bonusElement.textContent = `+ ${option.bonus.toLocaleString()} de bônus`;
        }
        
        // Atualiza o total
        const totalElement = document.querySelector('.font-bold.text-text-content2');
        if (totalElement) {
            const priceInReais = (option.price / 100).toFixed(2).replace('.', ',');
            totalElement.textContent = `R$ ${priceInReais}`;
        }
    }
    
    updateSelectionVisual() {
        console.log('🔄 Atualizando seleção visual...');
        console.log('Opção selecionada:', this.selectedDiamondOption);
        
        // Verifica se os elementos existem
        const diamondOptions = document.querySelectorAll('input[name="diamondOption"]');
        if (diamondOptions.length === 0) {
            console.error('❌ Nenhuma opção de diamante encontrada no DOM');
            return;
        }
        
        console.log('Encontradas', diamondOptions.length, 'opções de diamante');
        
        // Remove borda vermelha de todas as opções
        diamondOptions.forEach(radio => {
            // Procura a label que está associada ao radio button
            const label = document.querySelector(`label[for="${radio.id}"]`);
            if (label) {
                label.style.border = '2px solid transparent';
                label.style.borderRadius = '8px';
                label.style.boxShadow = 'none';
                console.log('Removendo borda de:', radio.value);
            } else {
                console.warn('⚠️ Label não encontrada para radio:', radio.id);
            }
        });
        
        // Adiciona borda vermelha na opção selecionada
        const selectedRadio = document.querySelector(`input[name="diamondOption"][value="${this.selectedDiamondOption}"]`);
        if (selectedRadio) {
            const label = document.querySelector(`label[for="${selectedRadio.id}"]`);
            if (label) {
                label.style.border = '2px solid #dc2626'; // Borda vermelha
                label.style.borderRadius = '8px';
                label.style.boxShadow = '0 0 0 1px #dc2626'; // Sombra adicional
                console.log('✅ Adicionando borda vermelha em:', this.selectedDiamondOption);
            } else {
                console.error('❌ Label não encontrada para:', this.selectedDiamondOption);
            }
        } else {
            console.error('❌ Radio button não encontrado para:', this.selectedDiamondOption);
        }
    }
    
    selectPixMethod() {
        // Seleciona automaticamente o PIX
        const pixRadio = document.querySelector('input[name="paymentMethod"][value="pix"]');
        if (pixRadio) {
            pixRadio.checked = true;
            
            // Adiciona borda vermelha no PIX selecionado
            const pixLabel = document.querySelector(`label[for="${pixRadio.id}"]`);
            if (pixLabel) {
                pixLabel.style.border = '2px solid #dc2626'; // Borda vermelha
                pixLabel.style.borderRadius = '8px';
            }
        }
        
        // Remove borda de outros métodos de pagamento (se existirem)
        document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
            if (radio.value !== 'pix') {
                const label = document.querySelector(`label[for="${radio.id}"]`);
                if (label) {
                    label.style.border = '2px solid transparent';
                    label.style.borderRadius = '8px';
                }
            }
        });
    }
    
    // Funções globais para redirecionamento direto
    setupGlobalFunctions() {
        window.openPixPayment = () => this.openPixPayment();
    }
    
    async openPixPayment() {
        // Previne chamadas duplicadas
        if (this.isGeneratingPix) {
            console.log('⚠️ Redirecionamento já está sendo processado, ignorando chamada duplicada');
            return;
        }
        
        const option = this.diamondOptions[this.selectedDiamondOption];
        if (!option) {
            console.error('Opção de diamante não encontrada');
            return;
        }
        
        this.currentPrice = option.price;
        
        // Facebook Pixel - InitiateCheckout Event
        if (typeof fbq !== 'undefined') {
            fbq('track', 'InitiateCheckout', {
                value: this.currentPrice,
                currency: 'BRL',
                content_name: 'Diamantes Free Fire',
                content_category: 'Games',
                content_type: 'product'
            });
            console.log('✅ Facebook Pixel: InitiateCheckout event tracked');
        }
        
        // UTMify Pixel - InitiateCheckout Event
        if (typeof window.utmifyPixel !== 'undefined') {
            window.utmifyPixel.track('initiate_checkout', {
                value: this.currentPrice,
                currency: 'BRL'
            });
            console.log('✅ UTMify Pixel: InitiateCheckout event tracked');
        }
        
        // Facebook Pixel - CustomEvent para redirecionamento
        if (typeof fbq !== 'undefined') {
            fbq('track', 'CustomEvent', {
                event_name: 'redirect_to_checkout',
                value: this.currentPrice,
                currency: 'BRL',
                content_name: `Diamantes Free Fire - ${option.diamonds.toLocaleString()} diamantes`,
                content_category: 'Games'
            });
            console.log('✅ Facebook Pixel: Redirect to checkout event tracked');
        }
        
        // Marca que está processando
        this.isGeneratingPix = true;
        
        // Mostra loading
        this.showLoading();
        
        try {
            // Mapeia o valor para o link correspondente
            const checkoutLinks = {
                '1998': 'https://pay.recargajogo8anos.online/checkout?product=0fe14f1d-724b-11f0-bb47-46da4690ad53',
                '4998': 'https://pay.recargajogo8anos.online/checkout?product=c6dedff9-724b-11f0-bb47-46da4690ad53',
                '9998': 'https://pay.recargajogo8anos.online/checkout?product=fbadbbba-724b-11f0-bb47-46da4690ad53',
                '19998': 'https://pay.recargajogo8anos.online/checkout?product=30058897-724c-11f0-bb47-46da4690ad53'
            };
            
            const checkoutUrl = checkoutLinks[this.selectedDiamondOption];
            
            if (!checkoutUrl) {
                throw new Error(`Link de checkout não encontrado para o valor: ${this.selectedDiamondOption}`);
            }
            
            console.log('🚀 Redirecionando para checkout:', checkoutUrl);
            console.log('💰 Valor selecionado:', this.currentPrice);
            console.log('💎 Diamantes:', option.diamonds.toLocaleString());
            
            // Aguarda um momento para os pixels serem enviados
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Redireciona para o checkout
            window.location.href = checkoutUrl;
            
        } catch (error) {
            console.error('Erro ao redirecionar para checkout:', error);
            this.showError('Erro ao processar pagamento. Tente novamente.');
        } finally {
            this.hideLoading();
            // Reseta a flag
            this.isGeneratingPix = false;
        }
    }
    
    // Função closePixPayment removida - não é mais necessária
    
    async generatePixData(option) {
        const price = (option.price / 100).toFixed(2);
        const transactionId = this.generateTransactionId();
        
        try {
            // Facebook Pixel - InitiateCheckout Event
            if (typeof fbq !== 'undefined') {
                fbq('track', 'InitiateCheckout', {
                    value: option.price,
                    currency: 'BRL',
                    content_name: `Diamantes Free Fire - ${option.diamonds.toLocaleString()} diamantes`,
                    content_category: 'Games',
                    content_type: 'product'
                });
                console.log('✅ Facebook Pixel: InitiateCheckout event tracked');
            }
            
            // UTMify Pixel - InitiateCheckout Event
            if (typeof window.utmifyPixel !== 'undefined') {
                window.utmifyPixel.track('begin_checkout', {
                    value: option.price,
                    currency: 'BRL'
                });
                console.log('✅ UTMify Pixel: InitiateCheckout event tracked');
            }
            
            // Gera PIX via API SyncPay
            const pixResponse = await generatePixWithSyncPay(
                parseFloat(price),
                `Diamantes Free Fire - ${option.diamonds.toLocaleString()} diamantes`,
                {
                    name: 'Cliente Free Fire',
                    cpf: '09115751031', // CPF válido da API
                    email: 'cliente@freefire.com',
                    phone: '21975784612',
                    ip: '127.0.0.1' // IP do cliente (pode ser obtido dinamicamente)
                }
            );
            
            // Extrai os dados corretos da resposta da API SyncPay
            const transactionHash = pixResponse.paymentId || pixResponse.id;
            const pixCode = pixResponse.pixCode || pixResponse.pix_code || pixResponse.qr_code;
            // Usa o campo qrCodeImage que já tem o prefixo data:image/png;base64,
            const qrCodeData = pixResponse.qrCodeImage || pixResponse.qrCode || pixResponse.qr_code || pixCode;
            
            console.log('🔍 Dados extraídos da API SyncPay:', {
                transactionHash,
                pixCode,
                qrCodeData,
                pixResponseKeys: Object.keys(pixResponse),
                fullResponse: pixResponse
            });
            
            console.log('Dados extraídos da API SyncPay:', {
                transactionHash,
                pixCode,
                qrCodeData,
                fullResponse: pixResponse
            });
            
            return {
                price: price,
                transactionId: transactionId,
                transactionHash: transactionHash,
                pixCode: pixCode,
                qrCodeData: qrCodeData,
                pixResponse: pixResponse
            };
        } catch (error) {
            console.error('Erro ao gerar PIX via SyncPay:', error);
            
            // Mostra erro detalhado para debug
            console.error('Detalhes do erro:', {
                message: error.message,
                stack: error.stack,
                type: error.constructor.name
            });
            
            // Fallback para PIX simulado se a API falhar
            console.log('Usando sistema de fallback para PIX simulado...');
            console.log('Motivo: API SyncPay falhou -', error.message);
            
            const pixCode = this.generatePixCode(price, transactionId);
            return {
                price: price,
                transactionId: transactionId,
                transactionHash: null, // Não há transactionHash no fallback
                pixCode: pixCode,
                qrCodeData: pixCode,
                error: error.message,
                isFallback: true,
                fallbackReason: 'API SyncPay falhou: ' + error.message
            };
        }
    }
    
    generateTransactionId() {
        return 'FF' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    
    generatePixCode(price, transactionId) {
        // Gera um código PIX válido (formato EMV QR Code)
        const pixData = {
            payloadFormatIndicator: "01",
            pointOfInitiationMethod: "12",
            merchantAccountInformation: {
                gui: "0014BR.GOV.BCB.PIX",
                key: "12345678901" // Chave PIX simulada
            },
            merchantCategoryCode: "0000",
            transactionCurrency: "986",
            transactionAmount: price,
            countryCode: "BR",
            merchantName: "Free Fire Store",
            merchantCity: "SAO PAULO",
            additionalDataFieldTemplate: {
                referenceLabel: transactionId
            }
        };
        
        // Converte para string EMV
        return this.buildEmvString(pixData);
    }
    
    buildEmvString(data) {
        // Constrói string EMV para PIX
        let emvString = "";
        
        // Payload Format Indicator
        emvString += "000201";
        
        // Point of Initiation Method
        emvString += "010212";
        
        // Merchant Account Information
        emvString += "26";
        let mai = "0014BR.GOV.BCB.PIX";
        mai += "0111" + data.merchantAccountInformation.key;
        emvString += this.padLength(mai.length) + mai;
        
        // Merchant Category Code
        emvString += "52040000";
        
        // Transaction Currency
        emvString += "5303986";
        
        // Transaction Amount
        emvString += "54" + this.padLength(data.transactionAmount.length) + data.transactionAmount;
        
        // Country Code
        emvString += "5802BR";
        
        // Merchant Name
        emvString += "59" + this.padLength(data.merchantName.length) + data.merchantName;
        
        // Merchant City
        emvString += "60" + this.padLength(data.merchantCity.length) + data.merchantCity;
        
        // Additional Data Field Template
        emvString += "62";
        let adft = "05" + this.padLength(data.additionalDataFieldTemplate.referenceLabel.length) + data.additionalDataFieldTemplate.referenceLabel;
        emvString += this.padLength(adft.length) + adft;
        
        // CRC16
        emvString += "6304";
        emvString += this.calculateCRC16(emvString);
        
        return emvString;
    }
    
    padLength(length) {
        return length.toString().padStart(2, '0');
    }
    
    calculateCRC16(data) {
        // Implementação simplificada do CRC16
        let crc = 0xFFFF;
        for (let i = 0; i < data.length; i++) {
            crc ^= data.charCodeAt(i) << 8;
            for (let j = 0; j < 8; j++) {
                if (crc & 0x8000) {
                    crc = (crc << 1) ^ 0x1021;
                } else {
                    crc <<= 1;
                }
            }
        }
        return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    }
    
    async updatePixModal(pixData) {
        // Remove loading do modal
        this.hideModalLoading();
        
        // Facebook Pixel - PIX Generated Event
        if (typeof fbq !== 'undefined') {
            fbq('track', 'CustomEvent', {
                event_name: 'pix_generated',
                value: this.currentPrice,
                currency: 'BRL',
                content_name: 'Diamantes Free Fire',
                content_category: 'Games',
                transaction_id: pixData.transactionId || pixData.id
            });
            console.log('✅ Facebook Pixel: PIX generated event tracked');
        }
        
        // UTMify Pixel - PIX Generated Event
        if (typeof window.utmifyPixel !== 'undefined') {
            window.utmifyPixel.track('pix_generated', {
                value: this.currentPrice,
                currency: 'BRL',
                transaction_id: pixData.transactionId || pixData.id
            });
            console.log('✅ UTMify Pixel: PIX generated event tracked');
        }
        
        // Remove qualquer aviso anterior
        const existingWarning = document.querySelector('#pixPaymentSection div[style*="background-color: #fef3c7"]');
        if (existingWarning) {
            existingWarning.remove();
        }
        
        // Atualiza o valor no modal
        const priceElement = document.querySelector('#pixPaymentSection p[style*="color: #059669"]');
        if (priceElement) {
            priceElement.textContent = `R$ ${pixData.price}`;
        }
        
        // Atualiza o código PIX
        const pixCodeInput = document.getElementById('pixCode');
        if (pixCodeInput) {
            pixCodeInput.value = pixData.pixCode;
        }
        
        // Mostra aviso apenas se estiver usando fallback
        if (pixData.isFallback) {
            console.warn('⚠️ SISTEMA USANDO FALLBACK FICTÍCIO');
            console.warn('Motivo:', pixData.fallbackReason);
            
            // Adiciona aviso visual no modal
            const warningDiv = document.createElement('div');
            warningDiv.style.cssText = `
                background-color: #fef3c7;
                border: 1px solid #fde68a;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 16px;
                text-align: center;
            `;
            warningDiv.innerHTML = `
                <p style="font-size: 14px; color: #92400e; margin: 0;">
                    <strong>⚠️ Modo de Demonstração:</strong> Sistema usando PIX simulado.<br>
                    <small>API SyncPay: ${pixData.fallbackReason}</small>
                </p>
            `;
            
            const pixSection = document.getElementById('pixPaymentSection');
            if (pixSection) {
                // Insere o aviso no topo da seção
                pixSection.insertBefore(warningDiv, pixSection.firstChild);
            }
        } else {
            console.log('✅ API SyncPay funcionando corretamente - QR Code real será gerado');
        }
        
        // Gera QR Code
        const isRealQR = await this.generateQRCode(pixData.qrCodeData);
        
        // Adiciona indicador se o QR Code é real ou não
        this.addQRCodeIndicator(isRealQR);
    }
    
    async generateQRCode(data) {
        const qrContainer = document.getElementById('pixQRCode');
        if (!qrContainer) {
            console.error('Container QR Code não encontrado');
            return false; // Indicate failure
        }
        qrContainer.innerHTML = ''; // Limpa o container

        // 1. Tenta carregar QR Code de imagem direta da SyncPay (se for uma URL)
        if (data && typeof data === 'string' && data.startsWith('http')) {
            try {
                console.log('🔄 Tentando carregar QR Code de imagem direta da SyncPay...');
                const img = document.createElement('img');
                img.src = data;
                img.style.cssText = `
                    width: 200px;
                    height: 200px;
                    border-radius: 8px;
                    margin: 0 auto;
                    display: block;
                    border: 2px solid #e5e7eb;
                `;
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    setTimeout(reject, 3000); // Timeout de 3 segundos (OTIMIZADO)
                });
                qrContainer.appendChild(img);
                console.log('✅ QR Code de imagem direta carregado com sucesso!');
                return true; // Sucesso
            } catch (error) {
                console.error('❌ Erro ao carregar QR Code de imagem direta:', error);
                // Continua para o próximo fallback
            }
        }

        // 1.5. Tenta carregar QR Code em base64 da SyncPay
        if (data && typeof data === 'string' && data.startsWith('data:image/')) {
            try {
                console.log('🔄 Tentando carregar QR Code em base64 da SyncPay...');
                console.log('Dados base64 recebidos:', data.substring(0, 100) + '...');
                console.log('Tamanho dos dados:', data.length);
                console.log('Tipo de dados:', typeof data);
                
                // Verifica se o base64 está duplicado e corrige
                let correctedData = data;
                if (data.includes('data:image/png;base64,data:image/png;base64,')) {
                    console.log('⚠️ Base64 duplicado detectado, corrigindo...');
                    correctedData = data.replace('data:image/png;base64,data:image/png;base64,', 'data:image/png;base64,');
                    console.log('✅ Base64 corrigido');
                }
                
                // Verifica se o base64 é válido e tem tamanho adequado
                try {
                    const base64Data = correctedData.replace('data:image/png;base64,', '');
                    console.log('Base64 puro (primeiros 50 chars):', base64Data.substring(0, 50));
                    console.log('Tamanho do base64 puro:', base64Data.length);
                    
                    // Verifica se o tamanho é adequado para um QR Code (mínimo ~500 chars)
                    if (base64Data.length < 500) {
                        console.warn('⚠️ Base64 muito pequeno para um QR Code válido:', base64Data.length);
                        throw new Error('Base64 muito pequeno para QR Code válido');
                    }
                    
                    // Tenta decodificar para verificar se é válido
                    const decoded = atob(base64Data);
                    console.log('✅ Base64 válido, tamanho decodificado:', decoded.length);
                    
                    // Verifica se o tamanho decodificado é adequado (mínimo ~300 bytes)
                    if (decoded.length < 300) {
                        console.warn('⚠️ Imagem decodificada muito pequena:', decoded.length);
                        throw new Error('Imagem decodificada muito pequena');
                    }
                    
                } catch (base64Error) {
                    console.error('❌ Base64 inválido ou muito pequeno:', base64Error);
                    throw new Error('Base64 inválido ou muito pequeno: ' + base64Error.message);
                }
                
                // Usa método mais robusto para carregar a imagem
                const img = new Image();
                img.style.cssText = `
                    width: 200px;
                    height: 200px;
                    border-radius: 8px;
                    margin: 0 auto;
                    display: block;
                    border: 2px solid #e5e7eb;
                `;
                
                await new Promise((resolve, reject) => {
                    img.onload = () => {
                        console.log('✅ Imagem carregada com sucesso!');
                        resolve();
                    };
                    img.onerror = (error) => {
                        console.error('❌ Erro no carregamento da imagem:', error);
                        reject(new Error('Falha ao carregar imagem do QR Code'));
                    };
                    setTimeout(() => reject(new Error('Timeout ao carregar imagem')), 5000);
                    
                    // Define o src por último
                    img.src = correctedData;
                });
                
                qrContainer.appendChild(img);
                console.log('✅ QR Code em base64 carregado com sucesso!');
                return true; // Sucesso
            } catch (error) {
                console.error('❌ Erro ao carregar QR Code em base64:', error);
                // Continua para o próximo fallback
            }
        }

        // 2. Tenta gerar QR Code com a biblioteca local (se for um código PIX)
        if (data && typeof data === 'string' && (data.startsWith('000201') || data.length > 50)) {
            try {
                // Verifica se a biblioteca QRCode está disponível
                if (typeof QRCode === 'undefined') {
                    console.log('🔄 QRCode library not found, trying to load...');
                    if (typeof window.loadQRCodeLibrary === 'function') {
                        await window.loadQRCodeLibrary();
                    } else {
                        // Fallback: tenta carregar diretamente (redundante, mas seguro)
                        await new Promise((resolve, reject) => {
                            const script = document.createElement('script');
                            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcode/1.5.3/qrcode.min.js';
                            script.onload = resolve;
                            script.onerror = reject;
                            document.head.appendChild(script);
                        });
                    }
                }

                if (typeof QRCode === 'undefined') {
                    throw new Error('QRCode library could not be loaded');
                }

                console.log('✅ QRCode library available, generating QR code from PIX string...');
                console.log('Data for QR code:', data);
                
                // Se o data não for um código PIX válido, tenta extrair do base64
                let pixCode = data;
                if (!data.startsWith('000201') && data.includes('data:image/png;base64,')) {
                    try {
                        const base64Data = data.replace('data:image/png;base64,', '');
                        const decoded = atob(base64Data);
                        // Tenta encontrar um código PIX na string decodificada
                        const pixMatch = decoded.match(/000201[0-9A-F]+/);
                        if (pixMatch) {
                            pixCode = pixMatch[0];
                            console.log('✅ Código PIX extraído do base64:', pixCode.substring(0, 50) + '...');
                        } else {
                            console.log('⚠️ Nenhum código PIX encontrado no base64, usando dados originais');
                        }
                    } catch (error) {
                        console.log('⚠️ Erro ao extrair código PIX do base64:', error);
                    }
                }

                const canvas = document.createElement('canvas');
                qrContainer.appendChild(canvas);

                let success = await new Promise(resolve => {
                    QRCode.toCanvas(canvas, pixCode, {
                        width: 200,
                        height: 200,
                        margin: 2,
                        color: { dark: '#000000', light: '#FFFFFF' }
                    }, (error) => {
                        if (error) {
                            console.error('❌ Error generating QR code from PIX string (local lib):', error);
                            qrContainer.removeChild(canvas);
                            resolve(false); // Indicate failure for this method
                        } else {
                            console.log('✅ QR Code gerado com sucesso da biblioteca local!');
                            resolve(true); // Indicate success
                        }
                    });
                });
                if (success) return true; // If local lib succeeded, return true

            } catch (error) {
                console.error('❌ Erro ao gerar QR Code com biblioteca local:', error);
                // Continua para o próximo fallback
            }
        }

        // 3. Fallback para API online (se for um código PIX e os anteriores falharem)
        if (data && typeof data === 'string' && data.startsWith('000201')) {
            const onlineSuccess = await this.generateOnlineQRCode(qrContainer, data);
            if (onlineSuccess) return true; // If online API succeeded, return true
        }

        // 4. Fallback visual se os dados não forem um código PIX ou URL, ou se todos os métodos falharem
        this.generateVisualFallback(qrContainer, data);
        return false; // Indicate that only visual fallback was used
    }
    
    async generateOnlineQRCode(container, data) {
        try {
            console.log('🔄 Tentando gerar QR Code online (QR Server) a partir do código PIX...');
            
            // Assume que 'data' é um código PIX real (000201...)
            // Usa API do QR Server para gerar QR Code do PIX real
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}&format=png`;
            
            const img = document.createElement('img');
            img.src = qrUrl;
            img.style.cssText = `
                width: 200px;
                height: 200px;
                border-radius: 8px;
                margin: 0 auto;
                display: block;
                border: 2px solid #e5e7eb;
            `;
            
            // Aguarda o carregamento da imagem
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                // Timeout de 3 segundos (OTIMIZADO)
                setTimeout(reject, 3000);
            });
            
            container.appendChild(img);
            console.log('✅ QR Code online (QR Server) gerado com sucesso!');
            return true; // Indicate success
            
        } catch (error) {
            console.error('❌ Erro ao gerar QR Code online (QR Server):', error);
            throw error; // Propaga o erro para que generateQRCode can handle the final fallback
        }
    }
    
    generateVisualFallback(container, data) {
        // Fallback visual caso tudo falhe
        const fallbackDiv = document.createElement('div');
        fallbackDiv.style.cssText = `
            width: 200px;
            height: 200px;
            border: 2px dashed #dc2626;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #fef2f2;
            margin: 0 auto;
        `;
        
        const icon = document.createElement('div');
        icon.innerHTML = '⚠️';
        icon.style.fontSize = '48px';
        icon.style.marginBottom = '8px';
        
        const text = document.createElement('div');
        text.innerHTML = `
            <div style="font-size: 14px; font-weight: bold; color: #dc2626; text-align: center;">
                QR Code Indisponível
            </div>
            <div style="font-size: 12px; color: #991b1b; text-align: center; margin-top: 4px;">
                Use o código PIX abaixo
            </div>
        `;
        
        fallbackDiv.appendChild(icon);
        fallbackDiv.appendChild(text);
        container.appendChild(fallbackDiv);
        
        console.log('🔄 Fallback visual gerado - QR Code indisponível');
    }
    
    addQRCodeIndicator(isRealPix) { // Changed parameter name
        // Adiciona indicador visual se o QR Code é real
        const qrContainer = document.getElementById('pixQRCode');
        if (!qrContainer) return;
        
        // Remove any existing indicator to prevent duplicates
        const existingIndicator = qrContainer.parentElement.querySelector('.qr-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        // Cria indicador
        const indicator = document.createElement('div');
        indicator.classList.add('qr-indicator'); // Add a class for easier removal
        indicator.style.cssText = `
            position: absolute;
            top: -10px;
            right: -10px;
            background: ${isRealPix ? '#059669' : '#dc2626'};
            color: white;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: bold;
            z-index: 10;
        `;
        indicator.textContent = isRealPix ? '✅ REAL' : '❌ FICTÍCIO';
        
        // Adiciona ao container do QR Code
        const qrWrapper = qrContainer.parentElement;
        if (qrWrapper) {
            qrWrapper.style.position = 'relative';
            qrWrapper.appendChild(indicator);
        }
        
        console.log(`QR Code: ${isRealPix ? 'REAL' : 'FICTÍCIO'}`);
    }
    
    copyPixCode() {
        const pixCodeInput = document.getElementById('pixCode');
        if (pixCodeInput) {
            const textToCopy = pixCodeInput.value;
            
            // Facebook Pixel - Copy PIX Code Event
            if (typeof fbq !== 'undefined') {
                fbq('track', 'CustomEvent', {
                    event_name: 'pix_code_copied',
                    value: this.currentPrice,
                    currency: 'BRL',
                    content_name: 'Diamantes Free Fire',
                    content_category: 'Games'
                });
                console.log('✅ Facebook Pixel: PIX code copied event tracked');
            }
            
            // UTMify Pixel - Copy PIX Code Event
            if (typeof window.utmifyPixel !== 'undefined') {
                window.utmifyPixel.track('pix_code_copied', {
                    value: this.currentPrice,
                    currency: 'BRL'
                });
                console.log('✅ UTMify Pixel: PIX code copied event tracked');
            }
            
            // Tenta usar a API moderna primeiro
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    this.showCopySuccess();
                }).catch(err => {
                    console.error('Erro ao copiar com Clipboard API:', err);
                    this.fallbackCopy(pixCodeInput);
                });
            } else {
                // Fallback para método antigo
                this.fallbackCopy(pixCodeInput);
            }
        }
    }
    
    fallbackCopy(input) {
        input.select();
        input.setSelectionRange(0, 99999); // Para dispositivos móveis
        
        try {
            document.execCommand('copy');
            this.showCopySuccess();
        } catch (err) {
            console.error('Erro ao copiar código PIX:', err);
            alert('Erro ao copiar código PIX. Copie manualmente.');
        }
    }
    
    // Função showCopySuccess removida - não é mais necessária
    
    showLoading() {
        const buyButton = document.querySelector('#compreAgoraBtn');
        if (buyButton) {
            buyButton.disabled = true;
            buyButton.innerHTML = '<span class="text-lg h-[18px] w-[18px] animate-spin">⏳</span> Redirecionando...';
        }
    }
    
    hideLoading() {
        const buyButton = document.querySelector('#compreAgoraBtn');
        if (buyButton) {
            buyButton.disabled = false;
            buyButton.innerHTML = `
                <span class="text-lg h-[18px] w-[18px]">
                    <svg width="1em" height="1em" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M54.125 34.1211C55.2966 32.9495 55.2966 31.05 54.125 29.8784C52.9534 28.7069 51.0539 28.7069 49.8823 29.8784L38.0037 41.7571L32.125 35.8784C30.9534 34.7069 29.0539 34.7069 27.8823 35.8784C26.7108 37.05 26.7108 38.9495 27.8823 40.1211L35.8823 48.1211C37.0539 49.2926 38.9534 49.2926 40.125 48.1211L54.125 34.1211Z" fill="currentColor"></path>
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M43.4187 3.4715C41.2965 2.28554 38.711 2.28554 36.5889 3.4715L8.07673 19.4055C6.19794 20.4555 4.97252 22.4636 5.02506 24.7075C5.36979 39.43 10.1986 63.724 37.0183 76.9041C38.8951 77.8264 41.1125 77.8264 42.9893 76.9041C69.809 63.724 74.6377 39.43 74.9825 24.7075C75.035 22.4636 73.8096 20.4555 71.9308 19.4055L43.4187 3.4715ZM39.5159 8.7091C39.8191 8.53968 40.1885 8.53968 40.4916 8.7091L68.9826 24.6313C68.6493 38.3453 64.2154 59.7875 40.343 71.5192C40.135 71.6214 39.8725 71.6214 39.6646 71.5192C15.7921 59.7875 11.3583 38.3453 11.025 24.6313L39.5159 8.7091Z" fill="currentColor"></path>
                    </svg>
                </span>
                Ir para Pagamento
            `;
        }
    }
    
    showError(message) {
        alert(message);
    }
    
    // Funções do modal removidas - não são mais necessárias
    
    startStatusCheck(transactionHash) {
        // Verifica se o transactionHash é válido
        if (!transactionHash) {
            console.warn('⚠️ TransactionHash não fornecido, pulando verificação de status');
            return;
        }
        
        console.log('🔄 Iniciando verificação de status para:', transactionHash);
        
        if (this.statusCheckInterval) {
            clearInterval(this.statusCheckInterval);
        }
        
        this.statusCheckInterval = setInterval(async () => {
            try {
                console.log('🔍 Verificando status do pagamento:', transactionHash);
                const status = await checkPixStatus(transactionHash);
                
                console.log('📊 Status do pagamento:', status);
                
                if (status.status === 'paid' || status.status === 'confirmed' || status.status === 'approved') {
                    this.paymentConfirmed(status);
                }
            } catch (error) {
                console.error('❌ Erro ao verificar status:', error);
            }
        }, 3000); // Verifica a cada 3 segundos (OTIMIZADO)
    }
    
    stopStatusCheck() {
        if (this.statusCheckInterval) {
            clearInterval(this.statusCheckInterval);
            this.statusCheckInterval = null;
        }
    }
    
    paymentConfirmed(status) {
        this.stopStatusCheck();
        
        // Mostra status de sucesso
        const statusElement = document.getElementById('paymentStatus');
        if (statusElement) {
            statusElement.classList.remove('pix-hidden');
            statusElement.innerHTML = `
                <div style="background: linear-gradient(135deg, #059669, #10b981); border-radius: 12px; padding: 20px; margin: 16px 0; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 12px; color: white; margin-bottom: 12px;">
                        <div style="font-size: 32px;">🎉</div>
                        <div style="font-size: 20px; font-weight: bold;">Pagamento Confirmado!</div>
                    </div>
                    <div style="text-align: center; color: white; font-size: 16px; line-height: 1.5;">
                        <div style="margin-bottom: 8px;">✅ <strong>Sucesso!</strong></div>
                        <div>Seus diamantes estão sendo creditados automaticamente na sua conta Free Fire.</div>
                        <div style="font-size: 14px; margin-top: 8px; opacity: 0.9;">⏱️ Tempo estimado: 30-60 segundos (OTIMIZADO)</div>
                    </div>
                </div>
            `;
        }
        
        // Facebook Pixel - Purchase Event
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Purchase', {
                value: this.currentPrice,
                currency: 'BRL',
                content_name: 'Diamantes Free Fire',
                content_category: 'Games',
                content_type: 'product'
            });
            console.log('✅ Facebook Pixel: Purchase event tracked');
        }
        
        // UTMify Pixel - Purchase Event
        if (typeof window.utmifyPixel !== 'undefined') {
            window.utmifyPixel.track('purchase', {
                value: this.currentPrice,
                currency: 'BRL'
            });
            console.log('✅ UTMify Pixel: Purchase event tracked');
        }
        
        // Fecha o modal após 5 segundos (OTIMIZADO)
        setTimeout(() => {
            this.closePixPayment();
        }, 8000);
    }
}

// Inicializa o sistema quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new PaymentSystem();
}); 