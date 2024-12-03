const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

let pedidos = []; // Armazenar pedidos de forma independente

wss.on('connection', (ws) => {
  console.log('Novo cliente conectado');

  // Recebe uma mensagem (novo pedido ou pedido pronto)
  ws.on('message', (message) => {
    const data = JSON.parse(message);
    console.log('Mensagem recebida:', data);

    if (data.message === 'Novo pedido') {
      // Adiciona o pedido ao array de pedidos (cada pedido tem um id único)
      const newOrder = {
        ...data.order,
        id: generateUniqueId(), // Gerar um ID único para cada pedido
      };
      pedidos.push(newOrder);
      console.log('Novo pedido recebido:', newOrder);

      // Envia o pedido para todos os clientes conectados (cozinha e entregador)
      broadcastToClients({
        message: 'Novo pedido',
        order: newOrder
      });
    }

    if (data.message === 'Pedido pronto') {
      // Procura o pedido pelo id e marca como pronto
      const pedidoPronto = pedidos.find(o => o.id === data.order.id);
      if (pedidoPronto) {
        pedidoPronto.status = 'pronto'; // Marca o pedido como pronto
        console.log('Pedido marcado como pronto:', pedidoPronto);

        // Envia a notificação para o entregador
        broadcastToClients({
          message: 'Pedido pronto para entrega',
          order: pedidoPronto // Envia os dados atualizados para o entregador
        });

        
      } else {
        console.log('Pedido não encontrado para marcar como pronto:', data.order.id);
      }
    }
  });

  // Função para gerar um ID único para cada pedido
  function generateUniqueId() {
    return Math.floor(Math.random() * 1000000); 
  }

  // Função para enviar uma mensagem para todos os clientes conectados
  function broadcastToClients(data) {
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  }

  // Quando o cliente desconectar
  ws.on('close', () => {
    console.log('Cliente desconectado');
  });
});

console.log('Servidor WebSocket rodando na porta 8080');












