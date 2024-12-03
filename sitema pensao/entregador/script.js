
const ws = new WebSocket('ws://localhost:8080');

// Função para adicionar um pedido à lista na tela do entregador
function addOrderToList(order, listId) {
  const orderList = document.getElementById(listId);
  const orderItem = document.createElement('li');

  // Adiciona as informações básicas do pedido
  orderItem.textContent = `Número do Pedido: ${order.pedidoNumero} - Nome: ${order.name} - Prato: ${order.item} - Endereço: ${order.address} - Pagamento: ${order.payment}`;

  // Tratamento para garantir que o valor de payment seja limpo
  const paymentType = order.payment.trim().toLowerCase();

  // Adiciona observação conforme o tipo de pagamento
  if (paymentType === 'dinheiro') {
    const cashNote = document.createElement('p');
    cashNote.textContent = 'Verifique se há necessidade de troco. (Será pago em Dinheiro)';
    orderItem.appendChild(cashNote);
  } else if (paymentType === 'pix') {
    const pixNote = document.createElement('p');
    pixNote.textContent = 'Pedido pago via PIX.';
    orderItem.appendChild(pixNote);
  } else if (paymentType === 'cartao') {
    const cardNote = document.createElement('p');
    cardNote.textContent = 'Não se esqueça da máquina de cartão, será pago via crédito ou débito.';
    orderItem.appendChild(cardNote);
  }

  // Adiciona o pedido à lista
  orderList.appendChild(orderItem);
}

// Quando a conexão WebSocket é aberta, envia uma mensagem de conexão
ws.onopen = () => {
  console.log('Conectado ao servidor WebSocket!');
  ws.send(JSON.stringify({ message: 'Sou o entregador' }));
};

// Quando o servidor enviar uma mensagem, processa a resposta
ws.onmessage = (event) => {
  const messageData = JSON.parse(event.data);

  // Quando um pedido pronto chega, adiciona-o à lista de pedidos prontos
  if (messageData.message === 'Pedido pronto para entrega') {
    addOrderToList(messageData.order, 'orders-list');
  }
};

ws.onerror = (error) => {
  console.error('Erro na conexão WebSocket:', error);
};

ws.onclose = () => {
  console.log('Conexão WebSocket fechada');
};
