// Configuração da API Witetec PIX - Baseada no Guia Completo
const WITETEC_CONFIG = {
    // URL da API Witetec
    apiUrl: 'https://api.witetec.net/transactions',
    
    // Chave da API Witetec
    apiKey: 'sk_e7293087d05347013fe02189d192accc599b43cac3cec885',
    
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
    
    // Valor mínimo em centavos (R$ 5,00)
    minAmount: 500
};

// Função para fazer requisição para API Witetec com retry otimizado
async function callWitetecAPI(data = {}) {
    let lastError;
    
    for (let attempt = 1; attempt <= WITETEC_CONFIG.retryAttempts; attempt++) {
        try {
            console.log(`🔄 Tentativa ${attempt}/${WITETEC_CONFIG.retryAttempts} - Witetec PIX API`);
            
            const options = {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'x-api-key': WITETEC_CONFIG.apiKey,
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
            const timeoutId = setTimeout(() => controller.abort(), WITETEC_CONFIG.timeout);
            
            try {
                const response = await fetch(WITETEC_CONFIG.apiUrl, {
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
                console.log('✅ Resposta da API Witetec:', result);
                return result;
                
            } catch (error) {
                clearTimeout(timeoutId);
                if (error.name === 'AbortError') {
                    throw new Error(`Timeout: A requisição demorou mais de ${WITETEC_CONFIG.timeout / 1000} segundos`);
                }
                throw error;
            }
            
        } catch (error) {
            lastError = error;
            console.error(`❌ Tentativa ${attempt} falhou:`, error.message);
            
            // Se não for a última tentativa, aguarda antes de tentar novamente
            if (attempt < WITETEC_CONFIG.retryAttempts) {
                console.log(`⏳ Aguardando ${WITETEC_CONFIG.retryDelay / 1000}s antes da próxima tentativa...`);
                await new Promise(resolve => setTimeout(resolve, WITETEC_CONFIG.retryDelay));
            }
        }
    }
    
    // Se chegou aqui, todas as tentativas falharam
    console.error('❌ Todas as tentativas falharam na API Witetec');
    throw lastError;
}

// Função para gerar PIX via Witetec - Baseada no Guia Completo
async function generatePixWithWitetec(amount, description, customerData = {}) {
    try {
        // Validar valor mínimo
        const amountInCents = Math.round(amount * 100);
        if (amountInCents < WITETEC_CONFIG.minAmount) {
            throw new Error(`Valor mínimo para PIX é R$ ${WITETEC_CONFIG.minAmount / 100}. Valor informado: R$ ${amount}`);
        }
        
        // Gerar referência única para o vendedor
        const sellerExternalRef = `SPO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Preparar payload para a API Witetec - Baseado no Guia Completo
        const pixPayload = {
            amount: amountInCents,
            method: "PIX",
            metadata: {
                sellerExternalRef: sellerExternalRef
            },
            customer: {
                name: customerData.name || "Cliente Free Fire",
                email: customerData.email || "cliente@freefire.com",
                phone: (customerData.phone || "9999999999").replace(/\D/g, ''),
                documentType: "CPF",
                document: (customerData.cpf || "09115751031").replace(/\D/g, '')
            },
            items: [
                {
                    title: description || "Diamantes Free Fire",
                    amount: amountInCents,
                    quantity: 1,
                    tangible: true,
                    externalRef: `item_0_${Date.now()}`
                }
            ]
        };
        
        console.log('📤 Enviando dados para Witetec PIX:', pixPayload);
        
        const response = await callWitetecAPI(pixPayload);
        
        console.log('📥 Resposta da Witetec PIX:', response);
        
        // Verificar se a API retornou sucesso - Baseado no Guia Completo
        if (!response.status || !response.data) {
            console.error('❌ Resposta da API não contém dados válidos:', response);
            throw new Error('Resposta da API não contém dados válidos');
        }
        
        // Verificar se a resposta tem os dados essenciais do PIX
        if (!response.data.pix || !response.data.pix.qrcode) {
            console.error('❌ Resposta PIX API sem código PIX:', response);
            throw new Error('Resposta PIX API sem código PIX');
        }
        
        // Formatar resposta compatível com o formato anterior - Baseado no Guia Completo
        const formattedResponse = {
            id: response.data.id,
            paymentId: response.data.id,
            status: response.data.status,
            pix_code: response.data.pix.copyPaste || response.data.pix.qrcode,
            pixCode: response.data.pix.copyPaste || response.data.pix.qrcode,
            pix_qr_code: response.data.pix.qrcode,
            qr_code: response.data.pix.qrcodeUrl,
            qrCode: response.data.pix.qrcodeUrl,
            copyPaste: response.data.pix.copyPaste || response.data.pix.qrcode,
            amount: amountInCents / 100,
            paymentMethod: 'pix',
            transaction: response.data,
            pix: response.data.pix
        };
        
        console.log('✅ Resposta formatada:', formattedResponse);
        return formattedResponse;
        
    } catch (error) {
        console.error('Erro ao gerar PIX via Witetec:', error);
        throw error;
    }
}

// Função para verificar status do PIX (não disponível na Witetec)
async function checkPixStatus(paymentId) {
    try {
        console.log('🔍 Verificando status do PIX (Witetec não fornece endpoint de consulta):', paymentId);
        
        // Witetec não fornece endpoint de consulta individual
        // Retorna status simulado
        return {
            id: paymentId,
            status: 'pending',
            message: 'Witetec PIX não fornece endpoint de consulta de status',
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
        console.log('🔍 Testando conectividade com Witetec PIX...');
        
        // Testa se o endpoint está acessível
        const testUrl = WITETEC_CONFIG.apiUrl;
        console.log('🌐 Testando URL:', testUrl);
        
        // Faz uma requisição simples para testar conectividade
        const response = await fetch(testUrl, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-api-key': WITETEC_CONFIG.apiKey
            },
            body: JSON.stringify({
                amount: WITETEC_CONFIG.minAmount,
                method: "PIX",
                metadata: {
                    sellerExternalRef: `TEST_${Date.now()}`
                },
                customer: {
                    name: "Teste Conectividade",
                    email: "teste@teste.com",
                    phone: "11999999999",
                    documentType: "CPF",
                    document: "12345678901"
                },
                items: [{
                    title: "Teste Conectividade",
                    amount: WITETEC_CONFIG.minAmount,
                    quantity: 1,
                    tangible: true,
                    externalRef: `test_${Date.now()}`
                }]
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
            accountId: 'witetec_account',
            apiVersion: 'v1',
            status: 'active',
            message: 'Witetec PIX API configurada e ativa',
            connectivity: connectivity,
            minAmount: WITETEC_CONFIG.minAmount / 100
        };
    } catch (error) {
        console.error('Erro ao obter informações da conta:', error);
        throw error;
    }
}

// Exporta as funções para uso global
window.WITETEC_CONFIG = WITETEC_CONFIG;
window.generatePixWithWitetec = generatePixWithWitetec;
window.checkPixStatus = checkPixStatus;
window.getAccountInfo = getAccountInfo;
window.testConnectivity = testConnectivity; 