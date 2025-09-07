import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Alert,
  StatusBar,
  Modal,
  TextInput,
  ActivityIndicator,
  BackHandler
} from 'react-native';

import styles from '../assets/css/styles';
import { 
  fetchTables, 
  updateTableStatus,
  fetchCategories,
  fetchProducts,
  fetchProductsByCategory,
  createOrder
} from './api';

const App = () => {

  const toggleCategory = (categoryId) => {
  setExpandedCategories(prev => ({
    ...prev,
    [categoryId]: !prev[categoryId]
  }));
};

  const [selectedTable, setSelectedTable] = useState(null);
  const [currentOrder, setCurrentOrder] = useState([]);
  const [activeTab, setActiveTab] = useState('tables');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [editingOrderItem, setEditingOrderItem] = useState(null);
  const [searchText, setSearchText] = useState('');
  
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


const loadData = async () => {
  try {
    setLoading(true);
    const [tablesRes, categoriesRes, productsRes] = await Promise.all([
      fetchTables(),
      fetchCategories(),
      fetchProducts()
    ]);
    
    const processedProducts = productsRes.data.map(product => ({
      ...product,
      price: Number(product.price) || 0,
      allExtras: (product.allExtras || []).map(extra => ({
        ...extra,
        price: Number(extra.price) || 0
      }))
    }));

    setTables(tablesRes.data);
    setCategories(categoriesRes.data);
    setProducts(processedProducts);
    setLoading(false);
  } catch (err) {
    console.error('Erro ao carregar dados:', err);
    setError('Erro ao carregar dados. Toque para tentar novamente.');
    setLoading(false);
  }
};


useEffect(() => {
  loadData();
}, []);

 
  const openItemModal = (item, orderItem = null) => {
    setSelectedItem({
      ...item,
      price: Number(item.price) || 0
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
  };

  const addItemFromModal = () => {
    if (!selectedItem) return;

    const orderItem = {
      ...selectedItem,
      extras: selectedExtras,
      quantity: itemQuantity,
      uniqueId: editingOrderItem?.uniqueId || Date.now() + Math.random(),
    };

    if (editingOrderItem) {
      setCurrentOrder(currentOrder.map(item => 
        item.uniqueId === editingOrderItem.uniqueId ? orderItem : item
      ));
    } else {
      setCurrentOrder([...currentOrder, orderItem]);
    }

    closeItemModal();
    setSearchText('');
  };

  const addToOrder = (item) => {
    const orderItem = {
      ...item,
      extras: [],
      quantity: 1,
      uniqueId: Date.now() + Math.random()
    };
    setCurrentOrder([...currentOrder, orderItem]);
  };

  const removeFromOrder = (uniqueId) => {
    setCurrentOrder(currentOrder.filter(item => item.uniqueId !== uniqueId));
  };

  const updateQuantity = (uniqueId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromOrder(uniqueId);
    } else {
      setCurrentOrder(
        currentOrder.map(item =>
          item.uniqueId === uniqueId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  
  const getTotalPrice = () => {
    return currentOrder.reduce((total, item) => {
      const price = Number(item.price) || 0;
      const extrasTotal = (item.extras || []).reduce((sum, extra) => 
        sum + (Number(extra.price) || 0), 0);
      return total + (price + extrasTotal) * (item.quantity || 1);
    }, 0);
  };

  const getTotalItems = () => {
    return currentOrder.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  const getItemTotal = () => {
    if (!selectedItem) return 0;
    const price = Number(selectedItem.price) || 0;
    const extrasTotal = selectedExtras.reduce((sum, extra) => 
      sum + (Number(extra.price) || 0), 0);
    return (price + extrasTotal) * itemQuantity;
  };

 
  const submitOrder = async () => {
    if (selectedTable && currentOrder.length > 0) {
      try {
        const items = currentOrder.map(item => ({
          productId: item.id,
          name: item.name,
          price: Number(item.price) || 0,
          quantity: item.quantity,
          extras: (item.extras || []).map(extra => ({
            ...extra,
            price: Number(extra.price) || 0
          }))
        }));
        
        await createOrder(selectedTable.id, items);
        await updateTableStatus(selectedTable.id, 'ocupada');
        
        setCurrentOrder([]);
        setSelectedTable(null);
        setShowOrderModal(false);
        setActiveTab('tables');
        
        Alert.alert(
          'Pedido Enviado',
          `Pedido enviado para Mesa ${selectedTable.numero}!`
        );
      } catch (error) {
        console.error('Erro ao enviar pedido:', error);
        Alert.alert('Erro', 'Não foi possível enviar o pedido.');
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Carregando dados...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setLoading(true);
            loadData();
          }}
        >
          <Text style={styles.retryButtonText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderTables = () => (
    <View style={styles.tablesGrid}>
      {tables.map((table) => (
        <TouchableOpacity
          key={table.id}
          style={[
            styles.tableCard,
            selectedTable?.id === table.id && styles.selectedTableCard,
            table.status === 'disponivel' && styles.availableTable,
            table.status === 'ocupada' && styles.occupiedTable,
            table.status === 'reservada' && styles.reservedTable,
          ]}
          onPress={() => {
            setSelectedTable(table);
            setActiveTab('menu');
          }}
        >
          <Text style={styles.tableNumber}>Mesa {table.numero}</Text>
          <View style={[styles.statusBadge, styles[`${table.status}Badge`]]}>
            <Text style={styles.statusText}>
              {table.status === 'disponivel' ? 'Disponível' :
               table.status === 'ocupada' ? 'Ocupada' : 'Reservada'}
            </Text>
          </View>
          {table.capacidade > 0 && (
            <Text style={styles.guestsText}>{table.capacidade} lugares</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderMenu = () => {
    if (!selectedTable) {
      return (
        <View style={styles.noTableContainer}>
          <Text style={styles.noTableText}>Selecione uma mesa primeiro</Text>
          <TouchableOpacity
            style={styles.selectTableButton}
            onPress={() => setActiveTab('tables')}
          >
            <Text style={styles.selectTableButtonText}>Voltar para Mesas</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const filteredProducts = searchText.length > 0
      ? products.filter(item =>
          item.name.toLowerCase().includes(searchText.toLowerCase()))
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

        {searchText.length > 0 ? (
          <View style={styles.filteredResults}>
            {filteredProducts.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItemCard}
                onPress={() => openItemModal(item)}
              >
                <View style={styles.menuItem}>
                  
                  <View style={styles.menuItemInfo}>
                    <Text style={styles.menuItemName}>{item.name}</Text>
                    <Text style={styles.menuItemPrice}>R$ {Number(item.price || 0).toFixed(2)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          categories.map(category => (
            <View key={category.id}>
              <TouchableOpacity 
                style={styles.categoryHeader}
                onPress={() => toggleCategory(category.id)}
              >
                <Text style={styles.categoryTitle}>{category.name}</Text>
                <Text style={styles.categoryToggle}>
                  {expandedCategories[category.id] ? '▲' : '▼'}
                </Text>
              </TouchableOpacity>
              
              {expandedCategories[category.id] && (
                <View style={styles.categoryItems}>
                  {filteredProducts
                    .filter(product => product.category_id === category.id)
                    .map(product => (
                      <TouchableOpacity
                        key={product.id}
                        style={styles.menuItemCard}
                        onPress={() => openItemModal(product)}
                      >
                        <View style={styles.menuItem}>
                          
                          <View style={styles.menuItemInfo}>
                            <Text style={styles.menuItemName}>{product.name}</Text>
                            <Text style={styles.menuItemPrice}>R$ {Number(product.price || 0).toFixed(2)}</Text>
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

  const renderOrderBottom = () => {
    if (getTotalItems() === 0) return null;
    return (
      <TouchableOpacity
        style={styles.orderBottom}
        onPress={() => setShowOrderModal(true)}
      >
        <View style={styles.orderBottomContent}>
          <View style={styles.orderBottomLeft}>
            <Text style={styles.orderBottomIcon}>🛒</Text>
            <Text style={styles.orderBottomText}>
              {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'}
            </Text>
          </View>
          <Text style={styles.orderBottomPrice}>
            R$ {getTotalPrice().toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderItemModal = () => {
    if (!selectedItem) return null;

    return (
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
          
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.itemSection}>
              
              <Text style={styles.modalDescription}>{selectedItem.description || 'Sem descrição'}</Text>
              <Text style={styles.modalPrice}>R$ {selectedItem.price.toFixed(2)}</Text>
            </View>

            {/* Seção de adicionais (opcional - precisa implementar no backend) */}
            {selectedItem.allExtras?.length > 0 && (
              <View style={styles.extrasSection}>
                <Text style={styles.extrasSectionTitle}>Adicionais</Text>
                {selectedItem.allExtras.map(extra => (
                  <TouchableOpacity
                    key={extra.id}
                    style={styles.extraItem}
                    onPress={() => toggleExtra(extra)}
                  >
                    <View style={styles.extraCheckbox}>
                      {selectedExtras.some(e => e.id === extra.id) && (
                        <Text style={styles.extraCheckmark}>✓</Text>
                      )}
                    </View>
                    <View style={styles.extraInfo}>
                      <Text style={styles.extraName}>{extra.name}</Text>
                      <Text style={styles.extraPrice}>
                        {extra.price > 0 ? `+R$ ${extra.price.toFixed(2)}` : 'Grátis'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Controle de quantidade */}
            <View style={styles.quantitySection}>
              <Text style={styles.quantitySectionTitle}>Quantidade</Text>
              <View style={styles.modalQuantityControls}>
                <TouchableOpacity
                  style={[styles.modalQuantityButton, itemQuantity <= 1 && styles.quantityButtonDisabled]}
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

            {/* Resumo do preço */}
            <View style={styles.priceResumeSection}>
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Item ({itemQuantity}x)</Text>
                <Text style={styles.priceValue}>R$ {(selectedItem.price * itemQuantity).toFixed(2)}</Text>
              </View>
              {selectedExtras.length > 0 && (
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Adicionais ({itemQuantity}x)</Text>
                  <Text style={styles.priceValue}>
                    R$ {(selectedExtras.reduce((sum, e) => sum + e.price, 0) * itemQuantity).toFixed(2)}
                  </Text>
                </View>
              )}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>R$ {getItemTotal().toFixed(2)}</Text>
              </View>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.addToOrderButton} onPress={addItemFromModal}>
              <Text style={styles.addToOrderButtonText}>
                {editingOrderItem ? 'Atualizar Item' : 'Adicionar à Comanda'} - R$ {getItemTotal().toFixed(2)}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };

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
          <Text style={styles.modalTitle}>Pedido Atual</Text>
          {selectedTable && (
            <View style={styles.tableBadge}>
              <Text style={styles.tableBadgeText}>Mesa {selectedTable.numero}</Text>
            </View>
          )}
        </View>
                
        <ScrollView style={styles.orderModalContent}>
          {currentOrder.map(item => (
            <View key={item.uniqueId} style={styles.orderModalItem}>
              <TouchableOpacity 
                style={styles.orderModalItemContent}
                onPress={() => {
                  setShowOrderModal(false);
                  openItemModal(item, item);
                }}
              >
                
                <View style={styles.orderModalItemInfo}>
                  <Text style={styles.orderModalItemName}>{item.name}</Text>
                  {item.extras?.length > 0 && (
                    <Text style={styles.orderModalExtras}>
                      + {item.extras.map(e => e.name).join(', ')}
                    </Text>
                  )}
                  <Text style={styles.orderModalItemPrice}>
    {`R$ ${(Number(item.price)).toFixed(2)} cada`}
  </Text>
                </View>
              </TouchableOpacity>
              <View style={styles.quantityControls}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.uniqueId, item.quantity - 1)}
                >
                  <Text style={styles.quantityButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.uniqueId, item.quantity + 1)}
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
            <Text style={styles.totalPrice}>R$ {getTotalPrice().toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={[styles.submitButton, !selectedTable && styles.disabledButton]}
            onPress={submitOrder}
            disabled={!selectedTable}
          >
            <Text style={styles.submitButtonText}>✓ Enviar Pedido</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      {/* Header */}
      <View style={styles.header}>
        {selectedTable && (
          <View style={styles.selectedTableBadge}>
            <Text style={styles.selectedTableText}>Mesa {selectedTable.numero}</Text>
          </View>
        )}
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'tables' && styles.activeTabButton]}
          onPress={() => setActiveTab('tables')}
        >
          <Text style={[styles.tabButtonText, activeTab === 'tables' && styles.activeTabButtonText]}>
            Mesas
          </Text>
        </TouchableOpacity>
      
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'tables' && renderTables()}
        {activeTab === 'menu' && renderMenu()}
      </View>

      {/* Order Bottom Bar */}
      {renderOrderBottom()}

      {/* Modals */}
      {renderItemModal()}
      {renderOrderModal()}
    </SafeAreaView>
  );
};

export default App;