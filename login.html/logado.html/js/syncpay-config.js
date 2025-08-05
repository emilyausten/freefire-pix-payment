// Configuração da API SyncPay PIX - Baseada na Documentação Oficial
const SYNCPAY_CONFIG = {
    // URL da API SyncPay
    apiUrl: 'https://api.syncpay.pro/v1/gateway/api/',
    
    // Chave da API SyncPay (codificada em Base64)
    apiKey: 'd0bb944b4e93470dfc084a95',
    
    // Configurações do produto Free Fire
    productConfig: {
        title: 'Diamantes Free Fire',
        description: 'Pacote de diamantes para Free Fire',
        category: 'games'
    },
    
    // Configurações de timeout (OTIMIZADO PARA VELOCIDADE)
    timeout: 5000, // 5 segundos
    
    // Configurações de retry (OTIMIZADO PARA VELOCIDADE)
    retryAttempts: 2, // 2 tentativas
    retryDelay: 1000, // 1 segundo
    
    // Valor mínimo em reais (R$ 1,00)
    minAmount: 1.00
};

// Função para codificar API Key em Base64
function encodeApiKey(apiKey) {
    return btoa(apiKey);
}

// Função para fazer requisição para API SyncPay com retry otimizado
async function callSyncPayAPI(data = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= SYNCPAY_CONFIG.retryAttempts; attempt++) {
        try {
            console.log(`🔄 Tentativa ${attempt}/${SYNCPAY_CONFIG.retryAttempts} - SyncPay PIX API`);
            
            // Codificar API Key em Base64 conforme documentação
            const encodedApiKey = encodeApiKey(SYNCPAY_CONFIG.apiKey);
            
            const options = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${encodedApiKey}`,
                    'User-Agent': 'FreeFireStore/1.0'
                },
                mode: 'cors',
                cache: 'no-cache'
            };
            
            if (data) {
                options.body = JSON.stringify(data);
            }
            
            // Implementar timeout usando AbortController
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), SYNCPAY_CONFIG.timeout);
            
            try {
                const response = await fetch(SYNCPAY_CONFIG.apiUrl, {
                    ...options,
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                
                console.log('📊 Status da resposta:', response.status);
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('❌ Resposta de erro:', errorText);
                    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
                }
                
                const result = await response.json();
                console.log('✅ Resposta da API SyncPay:', result);
                return result;
                
            } catch (error) {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    throw new Error(`Timeout: A requisição demorou mais de ${SYNCPAY_CONFIG.timeout / 1000} segundos`);
                }
                throw error;
            }
            
        } catch (error) {
            lastError = error;
            console.error(`❌ Tentativa ${attempt} falhou:`, error.message);
            
            // Se não for a última tentativa, aguarda antes de tentar novamente
            if (attempt < SYNCPAY_CONFIG.retryAttempts) {
                console.log(`⏳ Aguardando ${SYNCPAY_CONFIG.retryDelay / 1000}s antes da próxima tentativa...`);
                await new Promise(resolve => setTimeout(resolve, SYNCPAY_CONFIG.retryDelay));
            }
        }
    }
    
    // Se chegou aqui, todas as tentativas falharam
    console.error('❌ Todas as tentativas falharam na API SyncPay');
    throw lastError;
}

// Função para gerar PIX via SyncPay - Baseada na Documentação Oficial
async function generatePixWithSyncPay(amount, description, customerData = {}) {
    try {
        // Validar valor mínimo
        if (amount < SYNCPAY_CONFIG.minAmount) {
            throw new Error(`Valor mínimo para PIX é R$ ${SYNCPAY_CONFIG.minAmount}. Valor informado: R$ ${amount}`);
        }
        
        // Gerar referência única para o vendedor
        const externalRef = `FF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Preparar payload para a API SyncPay - Baseado na Documentação Oficial
        const pixPayload = {
            amount: amount,
            customer: {
                name: customerData.name || "Cliente Free Fire",
                email: customerData.email || "cliente@freefire.com",
                phone: customerData.phone || "9999999999",
                cpf: (customerData.cpf || "09115751031").replace(/\D/g, ''),
                externalRef: externalRef,
                address: {
                    street: "Rua Genérica",
                    streetNumber: "123",
                    complement: "Complemento",
                    zipCode: "00000000",
                    neighborhood: "Bairro",
                    city: "Cidade",
                    state: "SP",
                    country: "br"
                }
            },
            checkout: {
                utm_source: "freefire_store",
                utm_medium: "pix_payment",
                utm_campaign: "diamonds_purchase",
                utm_term: "diamantes",
                utm_content: "pix_payment"
            },
            pix: {
                expiresInDays: 2
            },
            items: [
                {
                    title: description || "Diamantes Free Fire",
                    quantity: 1,
                    unitPrice: amount,
                    tangible: true
                }
            ],
            postbackUrl: "https://freefirestore.com/webhook/",
            metadata: "Free Fire Diamonds Purchase",
            traceable: true,
            ip: customerData.ip || "127.0.0.1"
        };
        
        console.log('📤 Enviando dados para SyncPay PIX:', pixPayload);
        
        const response = await callSyncPayAPI(pixPayload);
        
        console.log('📥 Resposta da SyncPay PIX:', response);
        
        // Verificar se a API retornou sucesso - Baseado na Documentação Oficial
        if (response.status !== "success") {
            console.error('❌ Resposta da API não indica sucesso:', response);
            throw new Error(`Erro na API SyncPay: ${response.message || 'Status não é success'}`);
        }
        
        // Verificar se a resposta tem os dados essenciais do PIX
        if (!response.paymentCode) {
            console.error('❌ Resposta PIX API sem código PIX:', response);
            throw new Error('Resposta PIX API sem código PIX');
        }
        
        // Formatar resposta compatível com o formato anterior - Baseado na Documentação Oficial
        const formattedResponse = {
            id: response.idTransaction,
            paymentId: response.idTransaction,
            status: response.status_transaction,
            pix_code: response.paymentCode,
            pixCode: response.paymentCode,
            pix_qr_code: response.paymentCode,
            qr_code: response.paymentCodeBase64,
            qrCode: response.paymentCodeBase64,
            copyPaste: response.paymentCode,
            amount: amount,
            paymentMethod: 'pix',
            transaction: response,
            client_id: response.client_id,
            urlWebHook: response.urlWebHook,
            // Adiciona campos específicos para QR Code
            qrCodeBase64: response.paymentCodeBase64,
            qrCodeImage: response.paymentCodeBase64 ? `data:image/png;base64,${response.paymentCodeBase64}` : null,
            // Campo alternativo para QR Code - SEM DUPLICAR O BASE64
            qrCodeData: response.paymentCodeBase64 ? `data:image/png;base64,${response.paymentCodeBase64}` : response.paymentCode
        };
        
        console.log('✅ Resposta formatada:', formattedResponse);
        return formattedResponse;
        
    } catch (error) {
        console.error('Erro ao gerar PIX via SyncPay:', error);
        throw error;
    }
}

// Função para verificar status do PIX (não disponível na SyncPay)
async function checkPixStatus(paymentId) {
    try {
        console.log('🔍 Verificando status do PIX (SyncPay não fornece endpoint de consulta):', paymentId);
        
        // SyncPay não fornece endpoint de consulta individual
        // Retorna status simulado
        return {
            id: paymentId,
            status: 'pending',
            message: 'SyncPay PIX não fornece endpoint de consulta de status',
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ Erro ao verificar status PIX:', error);
        throw error;
    }
}

// Função para testar conectividade com a API
async function testConnectivity() {
    try {
        console.log('🔍 Testando conectividade com SyncPay PIX...');
        
        // Testa se o endpoint está acessível
        const testUrl = SYNCPAY_CONFIG.apiUrl;
        console.log('🌐 Testando URL:', testUrl);
        
        // Faz uma requisição simples para testar conectividade
        const encodedApiKey = encodeApiKey(SYNCPAY_CONFIG.apiKey);
        
        const response = await fetch(testUrl, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Basic ${encodedApiKey}`
            },
            body: JSON.stringify({
                amount: SYNCPAY_CONFIG.minAmount,
                customer: {
                    name: "Teste Conectividade",
                    email: "teste@teste.com",
                    cpf: "12345678901"
                },
                postbackUrl: "https://teste.com/webhook/"
            })
        });
        
        console.log('✅ Conectividade OK - Status:', response.status);
        return {
            connected: true,
            status: response.status,
            cors: response.headers.get('access-control-allow-origin') ? 'enabled' : 'disabled'
        };
    } catch (error) {
        console.error('❌ Erro de conectividade:', error);
        return {
            connected: false,
            error: error.message,
            type: error.name
        };
    }
}

// Função para obter informações da conta
async function getAccountInfo() {
    try {
        // Primeiro testa conectividade
        const connectivity = await testConnectivity();
        
        return {
            accountId: 'syncpay_account',
            apiVersion: 'v1',
            status: 'active',
            message: 'SyncPay PIX API configurada e ativa',
            connectivity: connectivity,
            minAmount: SYNCPAY_CONFIG.minAmount
        };
    } catch (error) {
        console.error('Erro ao obter informações da conta:', error);
        throw error;
    }
}

// Exporta as funções para uso global
window.SYNCPAY_CONFIG = SYNCPAY_CONFIG;
window.generatePixWithSyncPay = generatePixWithSyncPay;
window.checkPixStatus = checkPixStatus;
window.getAccountInfo = getAccountInfo;
window.testConnectivity = testConnectivity; 