import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";

import styles from "../assets/css/styles";
import {
  fetchTables,
  fetchCategories,
  fetchProducts,
  createOrder,
  addItemsToOrder,
  fetchOpenOrder,
  closeTableAndOrder,
  sendOrderToKitchen,
  listenForTablesUpdates,
  listenForOrdersUpdates,
  listenForProductsUpdates,
  listenForCategoriesUpdates,
  closeAllSSEConnections,
  replaceOrderItems,
} from "./api";
import Login from "./login";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [activeTab, setActiveTab] = useState("tables");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [editingOrderItem, setEditingOrderItem] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tableOrder, setTableOrder] = useState(null);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);

  const selectedTableRef = useRef(selectedTable);
  useEffect(() => {
    selectedTableRef.current = selectedTable;
  }, [selectedTable]);

  const handleLogin = (user) => {
    setIsLoggedIn(true);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setSelectedTable(null);
    setCurrentOrder([]);
    setActiveTab("tables");
    setTableOrder(null);
    closeAllSSEConnections();
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [tablesRes, categoriesRes, productsRes] = await Promise.all([
        fetchTables(),
        fetchCategories(),
        fetchProducts(),
      ]);

      const processedProducts = productsRes.data.map((product) => ({
        ...product,
        price: Number(product.price) || 0,
        allExtras: (product.allExtras || []).map((extra) => ({
          ...extra,
          price: Number(extra.price) || 0,
        })),
      }));

      setTables(tablesRes.data);
      setCategories(categoriesRes.data);
      setProducts(processedProducts);
      setError(null);
    } catch (err) {
      setError("Erro ao carregar dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      console.log("🚀 Usuário logado - Iniciando SSE...");
      loadData();

      // Ouvinte para atualizações de mesas
      const unsubscribeTables = listenForTablesUpdates((data) => {
        console.log("Evento SSE Tables recebido:", data);
        
        switch (data.type) {
          case "TABLE_STATUS_UPDATE":
            setTables((prevTables) =>
              prevTables.map((table) =>
                table.id === data.data.mesaId
                  ? { ...table, status: data.data.status }
                  : table
              )
            );
            break;
            
          case "TABLE_CREATED":
            setTables((prevTables) => [...prevTables, data.data]);
            break;
            
          case "TABLE_UPDATED":
            setTables((prevTables) =>
              prevTables.map((table) =>
                table.id === data.data.id ? { ...table, ...data.data } : table
              )
            );
            break;
            
          case "TABLE_DELETED":
            setTables((prevTables) =>
              prevTables.filter((table) => table.id !== data.data.id)
            );
            break;
            
          default:
            console.log("Tipo de evento de mesa não tratado:", data.type);
        }
      });

      // Ouvinte para atualizações de pedidos
      const unsubscribeOrders = listenForOrdersUpdates(async (data) => {
        console.log("Evento SSE Orders recebido:", data);
        const currentSelectedTable = selectedTableRef.current;
        
        switch (data.type) {
          case "ORDER_STATUS_UPDATE":
          case "ORDER_UPDATED":
          case "ORDER_REPLACED":
            if (currentSelectedTable && tableOrder && tableOrder.id === data.data.orderId) {
              const response = await fetchOpenOrder(currentSelectedTable.id);
              if (response.data.order) {
                setTableOrder(response.data.order);
              }
            }
            break;
            
          case "ORDER_CLOSED":
            if (currentSelectedTable && data.data.mesaId === currentSelectedTable.id) {
              setTableOrder(null);
              setShowOrderDetailsModal(false);
            }
            loadData();
            break;
            
          case "NEW_ORDER":
            if (currentSelectedTable && data.data.mesaId === currentSelectedTable.id) {
              const response = await fetchOpenOrder(currentSelectedTable.id);
              if (response.data.order) {
                setTableOrder(response.data.order);
              }
            }
            break;
            
          default:
            console.log("Tipo de evento de pedido não tratado:", data.type);
        }
      });

      // Ouvinte para atualizações de produtos
      const unsubscribeProducts = listenForProductsUpdates((data) => {
        console.log("Evento SSE Products recebido:", data);
        
        switch (data.type) {
          case "PRODUCT_CREATED":
          case "PRODUCT_UPDATED":
          case "PRODUCT_DELETED":
          case "ADDON_CREATED":
          case "ADDON_UPDATED":
          case "ADDON_DELETED":
            loadData();
            break;
            
          default:
            console.log("Tipo de evento de produto não tratado:", data.type);
        }
      });

      // Ouvinte para atualizações de categorias
      const unsubscribeCategories = listenForCategoriesUpdates((data) => {
        console.log("Evento SSE Categories recebido:", data);
        
        switch (data.type) {
          case "CATEGORY_CREATED":
          case "CATEGORY_UPDATED":
          case "CATEGORY_DELETED":
            loadData();
            break;
            
          default:
            console.log("Tipo de evento de categoria não tratado:", data.type);
        }
      });

      return () => {
        closeAllSSEConnections();
        unsubscribeTables();
        unsubscribeOrders();
        unsubscribeProducts();
        unsubscribeCategories();
      };
    }
  }, [isLoggedIn, tableOrder]);

  const handleTablePress = async (table) => {
    setSelectedTable(table);

    if (table.status === "ocupada") {
      try {
        const response = await fetchOpenOrder(table.id);
        if (response.data.order) {
          setTableOrder(response.data.order);
          setCurrentOrder([]);
          setActiveTab("menu");
          setShowOrderDetailsModal(true);
        } else {
          Alert.alert(
            "Aviso",
            "Esta mesa está ocupada, mas não foi possível encontrar um pedido ativo. Iniciando uma nova comanda."
          );
          setTableOrder(null);
          setActiveTab("menu");
        }
      } catch (err) {
        Alert.alert("Erro", "Não foi possível carregar o pedido da mesa.");
        setTableOrder(null);
        setActiveTab("menu");
      }
    } else {
      setTableOrder(null);
      setCurrentOrder([]);
      setActiveTab("menu");
    }
  };

  const handleCloseOrder = (mesaId) => {
    Alert.alert(
      "Fechar Mesa",
      "Confirma o fechamento da mesa? O pagamento será registrado como 'Dinheiro'.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Finalizar Pedido",
          onPress: async () => {
            try {
              const paymentMethod = "Dinheiro";
              await closeTableAndOrder(mesaId, paymentMethod);

              setTimeout(() => {
                loadData();
              }, 1000);

              setTableOrder(null);
              setCurrentOrder([]);
              setShowOrderDetailsModal(false);
              setSelectedTable(null);
              setActiveTab("tables");
            } catch (error) {
              Alert.alert(
                "Erro",
                "Não foi possível fechar o pedido e liberar a mesa."
              );
              console.error("Erro ao fechar pedido/mesa:", error);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleFinishOrder = async (mesaId) => {
    try {
      const paymentMethod = "Dinheiro";
      await closeTableAndOrder(mesaId, paymentMethod);

      setTableOrder(null);
      setCurrentOrder([]);
      setShowOrderDetailsModal(false);
      setSelectedTable(null);
      setActiveTab("tables");

      setTimeout(() => {
        loadData();
      }, 1000);
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error);
    }
  };

  const submitOrder = async () => {
    if (!selectedTable || currentOrder.length === 0) return;

    const items = currentOrder.map((item) => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      extras: item.extras || [],
    }));

    try {
      let orderId;
      if (tableOrder) {
        orderId = tableOrder.id;
        await addItemsToOrder(orderId, items);
        Alert.alert("Sucesso", `Itens adicionados ao pedido #${orderId}!`);
      } else {
        const response = await createOrder(selectedTable.id, items);
        orderId = response.data.orderId;
        await sendOrderToKitchen(orderId);
        Alert.alert("Sucesso", `Pedido #${orderId} enviado para a cozinha!`);
      }

      setCurrentOrder([]);
      setShowOrderModal(false);
      setActiveTab("tables");
      setSelectedTable(null);
      setTableOrder(null);
      loadData();
    } catch (error) {
      console.error("Submit order error:", error);
      Alert.alert("Erro", "Não foi possível enviar o pedido.");
    }
  };

  const toggleCategory = (categoryId) =>
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));

  const openItemModal = (item, orderItem = null) => {
    setSelectedItem({
      ...item,
      price: Number(item.price) || 0,
    });
    if (orderItem) {
      setEditingOrderItem(orderItem);
      setSelectedExtras(orderItem.extras || []);
      setItemQuantity(orderItem.quantity);
    } else {
      setEditingOrderItem(null);
      setSelectedExtras([]);
      setItemQuantity(1);
    }
    setShowItemModal(true);
  };

  const closeItemModal = () => {
    setShowItemModal(false);
    setSelectedItem(null);
    setSelectedExtras([]);
    setItemQuantity(1);
    setEditingOrderItem(null);
    setShowOrderDetailsModal(null);
  };

  const addItemFromModal = () => {
    const orderItem = {
      ...selectedItem,
      extras: selectedExtras,
      quantity: itemQuantity,
      uniqueId: editingOrderItem?.uniqueId || Date.now(),
    };
    if (editingOrderItem) {
      setCurrentOrder(
        currentOrder.map((item) =>
          item.uniqueId === editingOrderItem.uniqueId ? orderItem : item
        )
      );
    } else {
      setCurrentOrder([...currentOrder, orderItem]);
    }
    closeItemModal();
    setSearchText("");
  };

  const updateQuantity = (uniqueId, newQuantity) => {
    if (newQuantity <= 0) {
      setCurrentOrder(
        currentOrder.filter((item) => item.uniqueId !== uniqueId)
      );
    } else {
      setCurrentOrder(
        currentOrder.map((item) =>
          item.uniqueId === uniqueId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const getTotalPrice = () =>
    currentOrder.reduce(
      (total, item) =>
        total +
        ((Number(item.price) || 0) +
          (item.extras || []).reduce(
            (sum, extra) => sum + (Number(extra.price) || 0),
            0
          )) *
          item.quantity,
      0
    );

  const getTotalItems = () =>
    currentOrder.reduce((total, item) => total + item.quantity, 0);

  const getItemTotal = () =>
    selectedItem
      ? ((Number(selectedItem.price) || 0) +
          selectedExtras.reduce((sum, e) => sum + (Number(e.price) || 0), 0)) *
        itemQuantity
      : 0;

  const toggleExtra = (extra) =>
    setSelectedExtras((prev) =>
      prev.some((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra]
    );

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  if (loading)
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );

  if (error)
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );

  const renderTables = () => (
    <ScrollView>
      <View style={styles.tablesGrid}>
        {tables.map((table) => (
          <TouchableOpacity
            key={table.id}
            style={[
              styles.tableCard,
              table.status === "disponivel" && styles.availableTable,
              table.status === "ocupada" && styles.occupiedTable,
              table.status === "reservada" && styles.reservedTable,
            ]}
            onPress={() => handleTablePress(table)}
          >
            <Text style={styles.tableNumber}>Mesa {table.numero}</Text>
            <View style={[styles.statusBadge, styles[`${table.status}Badge`]]}>
              <Text style={styles.statusText}>
                {table.status === "disponivel"
                  ? "Disponível"
                  : table.status === "ocupada"
                  ? "Ocupada"
                  : "Reservada"}
              </Text>
            </View>
            {table.capacidade > 0 && (
              <Text style={styles.guestsText}>{table.capacidade} lugares</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderMenu = () => {
    if (!selectedTable)
      return (
        <View style={styles.noTableContainer}>
          <Text style={styles.noTableText}>Selecione uma mesa</Text>
          <TouchableOpacity
            style={styles.selectTableButton}
            onPress={() => setActiveTab("tables")}
          >
            <Text style={styles.selectTableButtonText}>Ver Mesas</Text>
          </TouchableOpacity>
        </View>
      );

    const filteredProducts = searchText
      ? products.filter((p) =>
          p.name.toLowerCase().includes(searchText.toLowerCase())
        )
      : products;

    return (
      <ScrollView style={styles.menuContainer}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="🔍 Buscar produto..."
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#999"
          />
        </View>

        {searchText ? (
          <View style={styles.filteredResults}>
            {filteredProducts.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.menuItemCard}
                onPress={() => openItemModal(p)}
              >
                <View style={styles.menuItem}>
                  <View style={styles.menuItemInfo}>
                    <Text style={styles.menuItemName}>{p.name}</Text>
                    <Text style={styles.menuItemPrice}>
                      R$ {Number(p.price || 0).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          categories.map((cat) => (
            <View key={cat.id}>
              <TouchableOpacity
                style={styles.categoryHeader}
                onPress={() => toggleCategory(cat.id)}
              >
                <Text style={styles.categoryTitle}>{cat.name}</Text>
                <Text style={styles.categoryToggle}>
                  {expandedCategories[cat.id] ? "▲" : "▼"}
                </Text>
              </TouchableOpacity>
              {expandedCategories[cat.id] && (
                <View style={styles.categoryItems}>
                  {products
                    .filter((p) => p.category_id === cat.id)
                    .map((p) => (
                      <TouchableOpacity
                        key={p.id}
                        style={styles.menuItemCard}
                        onPress={() => openItemModal(p)}
                      >
                        <View style={styles.menuItem}>
                          <View style={styles.menuItemInfo}>
                            <Text style={styles.menuItemName}>{p.name}</Text>
                            <Text style={styles.menuItemPrice}>
                              R$ {Number(p.price || 0).toFixed(2)}
                            </Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    );
  };

  const renderOrderBottom = () =>
    getTotalItems() > 0 && (
      <TouchableOpacity
        style={styles.orderBottom}
        onPress={() => setShowOrderModal(true)}
      >
        <View style={styles.orderBottomContent}>
          <View style={styles.orderBottomLeft}>
            <Text style={styles.orderBottomIcon}>🛒</Text>
            <Text style={styles.orderBottomText}>
              {getTotalItems()} {getTotalItems() === 1 ? "item" : "itens"}
            </Text>
          </View>
          <Text style={styles.orderBottomPrice}>
            R$ {getTotalPrice().toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    );

  const renderOrderModal = () => (
    <Modal
      visible={showOrderModal}
      animationType="slide"
      onRequestClose={() => setShowOrderModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowOrderModal(false)}>
            <Text style={styles.modalCloseButton}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Comanda</Text>
          {selectedTable && (
            <View style={styles.tableBadge}>
              <Text style={styles.tableBadgeText}>
                Mesa {selectedTable.numero}
              </Text>
            </View>
          )}
        </View>
        <ScrollView style={styles.orderModalContent}>
          {currentOrder.map((item) => (
            <View key={item.uniqueId} style={styles.orderModalItem}>
              <TouchableOpacity
                style={{ flex: 1 }}
                onPress={() => {
                  setShowOrderModal(false);
                  openItemModal(item, item);
                }}
              >
                <Text style={styles.orderModalItemName}>{item.name}</Text>
                {item.extras?.length > 0 && (
                  <Text style={styles.orderModalExtras}>
                    + {item.extras.map((e) => e.name).join(", ")}
                  </Text>
                )}
              </TouchableOpacity>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() =>
                    updateQuantity(item.uniqueId, item.quantity - 1)
                  }
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() =>
                    updateQuantity(item.uniqueId, item.quantity + 1)
                  }
                >
                  <Text style={styles.quantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
        <View style={styles.orderModalFooter}>
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Total:</Text>
            <Text style={styles.totalPrice}>
              R$ {getTotalPrice().toFixed(2)}
            </Text>
          </View>
          <TouchableOpacity
            style={[
              styles.submitButton,
              !selectedTable && styles.disabledButton,
            ]}
            onPress={submitOrder}
            disabled={!selectedTable}
          >
            <Text style={styles.submitButtonText}>✓ Enviar Pedido</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  const renderItemModal = () =>
    selectedItem && (
      <Modal
        visible={showItemModal}
        animationType="slide"
        onRequestClose={closeItemModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeItemModal}>
              <Text style={styles.modalCloseButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedItem.name}</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView>
            {selectedItem.allExtras?.length > 0 && (
              <View style={styles.extrasSection}>
                <Text style={styles.extrasSectionTitle}>Adicionais</Text>
                {selectedItem.allExtras.map((extra) => (
                  <TouchableOpacity
                    key={extra.id}
                    style={[
                      styles.extraItem,
                      selectedExtras.some((e) => e.id === extra.id) &&
                        styles.extraItemSelected,
                    ]}
                    onPress={() => toggleExtra(extra)}
                  >
                    <View style={styles.extraCheckbox}>
                      {selectedExtras.some((e) => e.id === extra.id) && (
                        <Text style={styles.extraCheckmark}>✓</Text>
                      )}
                    </View>
                    <View style={styles.extraInfo}>
                      <Text style={styles.extraName}>{extra.name}</Text>
                      <Text style={styles.extraPrice}>
                        +R$ {Number(extra.price).toFixed(2)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={styles.quantitySection}>
              <Text style={styles.quantitySectionTitle}>Quantidade</Text>
              <View style={styles.modalQuantityControls}>
                <TouchableOpacity
                  style={[
                    styles.modalQuantityButton,
                    itemQuantity <= 1 && styles.quantityButtonDisabled,
                  ]}
                  onPress={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                  disabled={itemQuantity <= 1}
                >
                  <Text style={styles.modalQuantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.modalQuantityText}>{itemQuantity}</Text>
                <TouchableOpacity
                  style={styles.modalQuantityButton}
                  onPress={() => setItemQuantity(itemQuantity + 1)}
                >
                  <Text style={styles.modalQuantityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.priceResumeSection}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>
                  {" "}
                  {itemQuantity}x - {selectedItem.name}{" "}
                </Text>
                <Text style={styles.priceValue}>
                  R$ {(selectedItem.price * itemQuantity).toFixed(2)}
                </Text>
              </View>
              {selectedExtras.length > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>
                    + {selectedExtras.map((e) => e.name).join(", ")}
                  </Text>
                  <Text style={styles.priceValue}>
                    R${" "}
                    {(
                      selectedExtras.reduce((sum, e) => sum + e.price, 0) *
                      itemQuantity
                    ).toFixed(2)}
                  </Text>
                </View>
              )}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  R$ {getItemTotal().toFixed(2)}
                </Text>
              </View>
            </View>
          </ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.addToOrderButton}
              onPress={addItemFromModal}
            >
              <Text style={styles.addToOrderButtonText}>
                {editingOrderItem ? "Atualizar Item" : "Adicionar à Comanda"} -
                R$ {getItemTotal().toFixed(2)}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );

  const renderOrderDetailsModal = () => {
    if (!tableOrder) return null;

    const totalOrderPrice = tableOrder.items.reduce((sum, item) => {
      const itemTotal = Number(item.price) * (item.quantity || 1);
      return sum + itemTotal;
    }, 0);

    const isOrderReady = tableOrder.status === "ready";

    return (
      <Modal
        animationType="slide"
        transparent={false}
        visible={showOrderDetailsModal}
        onRequestClose={() => setShowOrderDetailsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View
              style={[
                styles.orderStatusBadge,
                tableOrder.status === "sent_to_kitchen" &&
                  styles.statusSentToKitchen,
                tableOrder.status === "preparing" && styles.statusPreparing,
                tableOrder.status === "ready" && styles.statusReady,
              ]}
            >
              <Text style={styles.orderStatusText}>
                Status:{" "}
                {tableOrder.status === "sent_to_kitchen"
                  ? "🕒 Na Cozinha"
                  : tableOrder.status === "preparing"
                  ? "👨‍🍳 Em Preparação"
                  : "✅ Pronto para Entrega"}
              </Text>

              <TouchableOpacity onPress={() => setShowOrderDetailsModal(false)}>
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.orderDetailsList}>
              {tableOrder.items.map((item, index) => {
                const itemTotal = Number(item.price) * (item.quantity || 1);

                return (
                  <View key={index} style={styles.orderItemRow}>
                    <View style={styles.orderItemInfo}>
                      <Text style={styles.orderItemName}>
                        {item.quantity} - {item.name}
                        {item.notes ? ` (${item.notes})` : ""}
                      </Text>
                      {item.addons && item.addons.length > 0 && (
                        <Text style={styles.orderItemExtras}>
                          + {item.addons.map((addon) => addon.name).join(", ")}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.orderItemPrice}>
                      R$ {itemTotal.toFixed(2)}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>

            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>TOTAL:</Text>
              <Text style={styles.totalValue}>
                R$ {totalOrderPrice.toFixed(2)}
              </Text>
            </View>

            <View style={styles.modalButtonContainer}>
              {isOrderReady && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { backgroundColor: "#4CAF50", marginBottom: 10 },
                  ]}
                  onPress={() => handleFinishOrder(selectedTable.id)}
                >
                  <Text style={styles.actionButtonText}>
                    ✅ Finalizar Entrega
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: "#FFA726", marginBottom: 10 },
                ]}
                onPress={async () => {
                  try {
                    await sendOrderToKitchen(tableOrder.id);

                    const response = await fetchOpenOrder(selectedTable.id);
                    if (response.data.order) {
                      setTableOrder(response.data.order);
                    }

                    setCurrentOrder([]);
                    setShowOrderDetailsModal(false);
                  } catch (error) {
                    console.error("Erro ao atualizar status do pedido:", error);
                    setCurrentOrder([]);
                    setShowOrderDetailsModal(false);
                  }
                }}
              >
                <Text style={styles.actionButtonText}>✎ Editar Pedido</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        
        {selectedTable && (
          <View style={styles.selectedTableBadge}>
            <Text style={styles.selectedTableText}>
              Mesa {selectedTable.numero}
            </Text>
          </View>
        )}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>Sair</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "tables" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("tables")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "tables" && styles.activeTabButtonText,
            ]}
          >
            Mesas
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        {activeTab === "tables" ? renderTables() : renderMenu()}
      </View>
      {renderOrderBottom()}
      {renderItemModal()}
      {renderOrderModal()}
      {renderOrderDetailsModal()}
    </SafeAreaView>
  );
};

export default App;