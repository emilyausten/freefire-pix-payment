// Configuração da API BullsPay para PIX
const BULLSPAY_CONFIG = {
    // URL da API BullsPay
    apiUrl: 'https://pay.bullspay.net/api/v1',
    
    // Chave da API BullsPay (Secret Key)
    secretKey: '984e6c1f-39a3-422c-a427-66a18c9facd1',
    
    // Configurações do produto Free Fire
    productConfig: {
        title: 'Diamantes Free Fire',
        description: 'Pacote de diamantes para Free Fire',
        category: 'games'
    },
    
    // Configurações de timeout
    timeout: 10000, // 10 segundos
    
    // Configurações de retry
    retryAttempts: 3,
    retryDelay: 2000 // 2 segundos
};

// Função para fazer requisição para API BullsPay
async function callBullsPayAPI(endpoint, data = {}, method = 'POST') {
    try {
        const url = `${BULLSPAY_CONFIG.apiUrl}${endpoint}`;
        
        console.log('🔄 Fazendo requisição para:', url);
        console.log('📦 Dados:', data);
        console.log('🔑 Secret Key:', BULLSPAY_CONFIG.secretKey);
        
        const options = {
            method: method,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': BULLSPAY_CONFIG.secretKey,
                'User-Agent': 'FreeFireStore/1.0'
            },
            mode: 'cors', // Adiciona modo CORS explícito
            cache: 'no-cache' // Evita cache
        };
        
        if (method !== 'GET' && data) {
            options.body = JSON.stringify(data);
        }
        
        console.log('⚙️ Opções da requisição:', options);
        
        const response = await fetch(url, options);
        
        console.log('📊 Status da resposta:', response.status);
        console.log('📋 Headers da resposta:', response.headers);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('❌ Resposta de erro:', errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        
        const result = await response.json();
        console.log('✅ Resposta da API:', result);
        return result;
    } catch (error) {
        console.error('❌ Erro na API BullsPay:', error);
        console.error('🔍 Tipo de erro:', error.name);
        console.error('📝 Mensagem:', error.message);
        console.error('📍 Stack:', error.stack);
        throw error;
    }
}

// Função para gerar PIX via BullsPay
async function generatePixWithBullsPay(amount, description, customerData = {}) {
    try {
        // Cria a transação PIX usando a API BullsPay
        const transactionData = {
            name: customerData.name || 'Cliente Free Fire',
            email: customerData.email || 'cliente@freefire.com',
            cpf: customerData.cpf || '09115751031',
            phone: customerData.phone || '21975784612',
            paymentMethod: 'PIX',
            amount: Math.round(amount * 100), // Valor em centavos
            traceable: true,
            items: [
                {
                    unitPrice: Math.round(amount * 100), // Valor em centavos
                    title: description,
                    quantity: 1,
                    tangible: false
                }
            ],
            externalId: `FF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            postbackUrl: 'https://seu-dominio.com/webhook/pix',
            utmQuery: 'source=freefire_store&medium=web&campaign=diamantes'
        };
        
        console.log('📤 Enviando dados para BullsPay:', transactionData);
        
        const response = await callBullsPayAPI('/transaction.purchase', transactionData);
        
        console.log('📥 Resposta da BullsPay:', response);
        
        // Verifica se a resposta tem os campos esperados
        if (!response.paymentId && !response.id) {
            console.error('❌ Resposta da API não contém paymentId:', response);
            throw new Error('Resposta da API não contém ID da transação');
        }
        
        return response;
    } catch (error) {
        console.error('Erro ao gerar PIX:', error);
        throw error;
    }
}

// Função para verificar status do PIX
async function checkPixStatus(paymentId) {
    try {
        // Verifica se o paymentId é válido
        if (!paymentId) {
            throw new Error('PaymentId é obrigatório para verificar status');
        }
        
        console.log('🔍 Verificando status do PIX:', paymentId);
        
        // Corrigido: envia o ID no corpo da requisição conforme documentação da API
        const response = await callBullsPayAPI('/transaction.getPaymentDetails', {
            id: paymentId
        }, 'POST');
        
        console.log('📊 Resposta do status:', response);
        
        // Mapeia os status da BullsPay para o formato esperado pelo sistema
        const statusMapping = {
            'PENDING': 'pending',
            'APPROVED': 'paid',
            'REJECTED': 'failed',
            'CHARGEBACK': 'cancelled',
            'REFUNDED': 'refunded'
        };
        
        const result = {
            ...response,
            status: statusMapping[response.status] || response.status
        };
        
        console.log('✅ Status mapeado:', result);
        return result;
    } catch (error) {
        console.error('❌ Erro ao verificar status PIX:', error);
        throw error;
    }
}

// Função para listar transações
async function listTransactions(limit = 10, offset = 0) {
    try {
        // BullsPay não tem endpoint específico para listar transações
        // Retorna informações básicas da conta
        const response = await getAccountInfo();
        return {
            transactions: [],
            accountInfo: response,
            message: 'BullsPay não fornece endpoint para listar transações'
        };
    } catch (error) {
        console.error('Erro ao listar transações:', error);
        throw error;
    }
}

// Função para testar conectividade com a API
async function testConnectivity() {
    try {
        console.log('🔍 Testando conectividade com BullsPay...');
        
        // Testa se o endpoint está acessível
        const testUrl = `${BULLSPAY_CONFIG.apiUrl}/transaction.purchase`;
        console.log('🌐 Testando URL:', testUrl);
        
        // Faz uma requisição simples para testar conectividade
        const response = await fetch(testUrl, {
            method: 'POST', // Usa POST para testar a API real
            mode: 'cors',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': BULLSPAY_CONFIG.secretKey
            },
            body: JSON.stringify({
                name: 'Teste Conectividade',
                email: 'teste@teste.com',
                cpf: '12345678901',
                phone: '11999999999',
                paymentMethod: 'PIX',
                amount: 500, // Valor mínimo em centavos
                traceable: true,
                items: [{
                    unitPrice: 500,
                    title: 'Teste Conectividade',
                    quantity: 1,
                    tangible: false
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
        
        // BullsPay não tem endpoint específico para informações da conta
        // Retorna informações básicas da configuração
        return {
            accountId: 'bullspay_account',
            apiVersion: 'v1',
            status: 'active',
            message: 'BullsPay API configurada e ativa',
            connectivity: connectivity
        };
    } catch (error) {
        console.error('Erro ao obter informações da conta:', error);
        throw error;
    }
}

// Exporta as funções para uso global
window.BULLSPAY_CONFIG = BULLSPAY_CONFIG;
window.generatePixWithBullsPay = generatePixWithBullsPay;
window.checkPixStatus = checkPixStatus;
window.listTransactions = listTransactions;
window.getAccountInfo = getAccountInfo;
window.testConnectivity = testConnectivity; 