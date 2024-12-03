const ws = new WebSocket('ws://localhost:8080');

// Quando a conexão WebSocket for aberta
ws.onopen = () => {
  console.log('Conectado ao servidor WebSocket!');
};

// Quando a conexão WebSocket receber uma mensagem
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.message === 'Novo pedido') {
    addOrderToList(data.order);
  }

  if (data.message === 'Pedido pronto para entrega') {
    const orderElement = document.getElementById('order-' + data.order.id);
    if (orderElement) {
      orderElement.remove(); // Remove o pedido da lista de recebidos
    }
    addOrderToWaitingList(data.order); // Adiciona à lista de aguardando entrega
  }

  if (data.message === 'Atualização de pedido') {
    // Atualiza o status do pedido se ele estiver aguardando entrega
    const orderElement = document.getElementById('order-' + data.order.id);
    if (orderElement) {
      orderElement.querySelector('.status').innerText = data.order.status;
    }
  }
};

// Função para adicionar pedido à lista de recebidos
function addOrderToList(order) {
  const list = document.getElementById('orders-list');
  const orderElement = document.createElement('li');
  orderElement.className = 'order-item';
  orderElement.id = 'order-' + order.id;

  // Adiciona os dados do pedido e o botão de marcar como pronto para cada pedido
  orderElement.innerHTML = `
    <strong>Pedido Nº ${order.pedidoNumero}</strong><br>
    Nome: ${order.name}<br>
    Endereço: ${order.address}<br>
    Item: ${order.item}<br>
    Pagamento: ${order.payment}<br>
    Troco: ${order.troco}<br>
    Personalização: ${order.customize ? "Sim" : "Não"}<br>
    Status: <span class="status">Recebido</span><br>
    <button onclick="markAsReady(${order.id})">Marcar como Pronto</button>
  `;

  list.appendChild(orderElement);
}

// Função para adicionar pedido à lista de aguardando entrega
function addOrderToWaitingList(order) {
  const waitingList = document.getElementById('waiting-list');
  const existingOrder = document.getElementById('waiting-order-' + order.id);

  // Evita adicionar duplicados
  if (!existingOrder) {
    const orderElement = document.createElement('li');
    orderElement.className = 'order-item';
    orderElement.id = 'waiting-order-' + order.id;

    // Adiciona os dados do pedido
    orderElement.innerHTML = `
      <strong>Pedido Nº ${order.pedidoNumero}</strong><br>
      Nome: ${order.name}<br>
      Endereço: ${order.address}<br>
      Item: ${order.item}<br>
      Pagamento: ${order.payment}<br>
      Troco: ${order.troco}<br>
      Personalização: ${order.customize ? "Sim" : "Não"}<br>
      Status: <span class="status">${order.status}</span><br>
    `;

    waitingList.appendChild(orderElement);
  }
}

// Função para marcar o pedido como pronto e enviar os dados
function markAsReady(orderId) {
  const orderElement = document.getElementById('order-' + orderId);

  if (orderElement) {
    const orderData = {
      pedidoNumero: orderElement.querySelector('strong').innerText.replace('Pedido Nº ', ''),
      name: orderElement.querySelector('strong').nextSibling.nextSibling.nodeValue.trim(),
      address: orderElement.querySelector('br:nth-of-type(1)').nextSibling.nodeValue.trim(),
      item: orderElement.querySelector('br:nth-of-type(2)').nextSibling.nodeValue.trim(),
      payment: orderElement.querySelector('br:nth-of-type(3)').nextSibling.nodeValue.trim(),
      troco: parseInt(orderElement.querySelector('br:nth-of-type(4)').nextSibling.nodeValue.trim(), 10),
      customize: orderElement.querySelector('br:nth-of-type(5)').nextSibling.nodeValue.trim() === "Sim",
      customItems: '', 
      status: 'pronto',
      id: orderId
    };

    // Envia os dados completos do pedido para o servidor
    ws.send(JSON.stringify({ message: 'Pedido pronto', order: orderData }));

    console.log('Pedido enviado para o servidor:', orderData);

    // Atualiza o status visualmente, sem adicionar diretamente à lista
    orderElement.querySelector('.status').innerText = 'Aguardando entrega';
  }
}
