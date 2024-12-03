document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('order-form');
    let ws = new WebSocket('ws://localhost:8080');

    // Elementos
    const itemSelect = document.getElementById('item');
    const customLabel = document.getElementById('customization-area');
    const trocoInfo = document.getElementById('troco-info');
    const pixInfo = document.getElementById('pix-info');
    const pedidoFeitoSection = document.getElementById('pedido-feito');
    const formContainer = document.getElementById('form-container');
    const statusText = document.getElementById('status-text');
    const pedidoNumeroDisplay = document.createElement('p'); // Novo elemento para exibir o número do pedido

    // Adiciona o campo para exibir o número do pedido
    pedidoFeitoSection.insertAdjacentElement('afterbegin', pedidoNumeroDisplay);

    let pedidoNumero = 0; // Contador para gerar número do pedido localmente

    // Função para configurar os eventos do WebSocket
    const setupWebSocketListeners = () => {
        ws.onopen = () => {
            console.log('Conectado ao servidor WebSocket.');
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Mensagem recebida do servidor:', data);

                if (data.message === 'status_pedido') {
                    statusText.innerText = `Status do Pedido: ${data.status}`;
                } else if (data.message === 'pedido_confirmado') {
                    statusText.innerText = `Pedido confirmado! Número do pedido: ${data.pedidoNumero}`;
                } else if (data.message === 'atualizacao_status') {
                    statusText.innerText = `Atualização do Pedido: ${data.status}`;
                } else if (data.message === 'erro_pedido') {
                    statusText.innerText = `Erro: ${data.detalhes}`;
                    formContainer.style.display = 'block';
                    pedidoFeitoSection.style.display = 'none';
                }
            } catch (error) {
                console.error('Erro ao processar mensagem do servidor:', error);
            }
        };

        ws.onclose = () => {
            console.warn('Conexão WebSocket fechada. Tentando reconectar...');
            setTimeout(() => {
                ws = new WebSocket('ws://localhost:8080');
                setupWebSocketListeners();
            }, 3000);
        };

        ws.onerror = (error) => {
            console.error('Erro no WebSocket:', error);
        };
    };

    setupWebSocketListeners();

    // Controla a exibição do campo de personalização
    itemSelect.addEventListener('change', function () {
        customLabel.style.display = this.value === 'montar' ? 'block' : 'none';
    });

    // Controla a exibição do campo de troco e informações PIX
    document.getElementById('payment').addEventListener('change', function () {
        trocoInfo.style.display = this.value === 'dinheiro' ? 'block' : 'none';
        pixInfo.style.display = this.value === 'pix' ? 'block' : 'none';
    });

    // Verifica as opções ao carregar a página
    if (itemSelect.value === 'montar') {
        customLabel.style.display = 'block';
    }

    // Envio do formulário
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const item = itemSelect.value;
        const payment = document.getElementById('payment').value;
        const troco = document.getElementById('troco').value;
        const name = document.getElementById('name').value;
        const address = document.getElementById('address').value;
        const customItems = document.getElementById('custom-items').value;

        // Incrementa o número do pedido
        pedidoNumero += 1;
        const pedidoNumeroAtual = `#${pedidoNumero}`;

        const order = {
            pedidoNumero: pedidoNumeroAtual,
            name,
            address,
            item,
            payment,
            troco: troco ? parseFloat(troco) : 0,
            customize: customItems ? true : false,
            customItems: customItems || '',
        };

        const messageToSend = {
            message: 'Novo pedido',
            order: order,
        };

        console.log('Pedido que será enviado:', messageToSend);

        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(messageToSend));
            console.log('Pedido enviado:', messageToSend);

            // Atualiza o status do pedido
            statusText.innerText = 'Pedido enviado para a cozinha!';
            pedidoNumeroDisplay.textContent = `Número do Pedido: ${pedidoNumeroAtual}`;
            document.getElementById('pedido-nome').textContent = order.name;
            document.getElementById('pedido-endereco').textContent = order.address;
            document.getElementById('pedido-item').textContent = order.item;
            document.getElementById('pedido-pagamento').textContent = order.payment;

            pedidoFeitoSection.style.display = 'block';
            formContainer.style.display = 'none';
        } else {
            console.error('Erro: WebSocket não está conectado.');
            statusText.innerText = 'Erro ao enviar o pedido. Tente novamente.';
        }
    });

    // Botão para realizar um novo pedido
    document.getElementById('realizar-novo-pedido').addEventListener('click', () => {
        form.reset();
        pedidoFeitoSection.style.display = 'none';
        formContainer.style.display = 'block';
        pedidoNumeroDisplay.textContent = ''; // Limpa o número do pedido
    });
});



  
  
  
  
