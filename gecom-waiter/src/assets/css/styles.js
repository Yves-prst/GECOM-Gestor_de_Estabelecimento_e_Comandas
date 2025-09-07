import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#ffffff',
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: 20,
  },
  
  selectedTableBadge: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    marginTop: 8,
  },
  selectedTableText: {
    color: '#1976d2',
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#2196f3',
  },
  tabButtonText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabButtonText: {
    color: '#2196f3',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },

  tablesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
  },
  tableCard: {
    width: '48%',
    backgroundColor: '#000000ff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedTableCard: {
    borderColor: '#2196f3',
    borderWidth: 2,
    backgroundColor: '#e3f2fd',
  },
  availableTable: {
    backgroundColor: '#1fc33290',
    borderColor: '#4caf50',
  },
  occupiedTable: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
  },
  reservedTable: {
    backgroundColor: '#2195f372',
    borderColor: 'dodgerblue',
  },
  tableNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  availableBadge: {
    backgroundColor: '#4caf50',
  },
  occupiedBadge: {
    backgroundColor: '#ff0800ff',
  },
  reservedBadge: {
    backgroundColor: '#363cf4ff',
  },
  statusText: {
    color: '#000000ff',
    fontSize: 12,
    fontWeight: '600',
  },
  guestsText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },

  // Menu

  noTableContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noTableText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  selectTableButton: {
    backgroundColor: '#2196f3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  selectTableButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  menuContainer: {
    flex: 1,
  },
  categoryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  expandIcon: {
    fontSize: 16,
    color: '#666',
  },
  categoryContent: {
    padding: 16,
  },
  menuItemCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 16,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    padding: 12,
  },
  menuItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  menuItemDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  menuItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4caf50',
    marginBottom: 2,
  },
  menuItemExtrasAvailable: {
    fontSize: 10,
    color: '#2196f3',
    fontStyle: 'italic',
  },
  addIndicator: {
    backgroundColor: '#4caf50',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
  },
  addIndicatorText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quickExtrasSection: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  quickExtrasTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  quickExtrasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  quickExtraChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  quickExtraChipSelected: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
  },
  quickExtraChipText: {
    fontSize: 10,
    color: '#666',
  },
  quickExtraChipTextSelected: {
    color: '#2196f3',
    fontWeight: '600',
  },
  quickAddButton: {
    backgroundColor: '#4caf50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  quickAddButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  totalWithExtras: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalWithExtrasText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },

  orderBottom: {
    borderRadius: 20,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    height: 75,
  },
  orderBottomContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderBottomLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderBottomIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  orderBottomText: {
    fontSize: 16,
    fontWeight: '600',
  },
  orderBottomPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4caf50',
  },

  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#666',
    width: 24,
    textAlign: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  modalContent: {
    flex: 1,
  },
  itemSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    lineHeight: 22,
  },
  modalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  extrasSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  extrasSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  extraItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#fafafa',
  },
  extraCheckbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#2196f3',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  extraCheckmark: {
    color: '#2196f3',
    fontWeight: 'bold',
    fontSize: 14,
  },
  extraInfo: {
    flex: 1,
  },
  extraName: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  extraPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  quantitySection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  quantitySectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  modalQuantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  modalQuantityButton: {
    backgroundColor: '#2196f3',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  modalQuantityButtonText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalQuantityText: {
    fontSize: 24,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
    color: '#333',
  },
  priceResumeSection: {
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
  },
  priceValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#ffffff',
  },
  addToOrderButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToOrderButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  orderModalContent: {
    flex: 1,
    padding: 16,
  
  },
  orderModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderModalItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  orderModalImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  orderModalItemInfo: {
    flex: 1,
  },
  orderModalItemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  orderModalExtras: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  orderModalItemPrice: {
    fontSize: 14,
    color: '#666',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#e0e0e0',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  orderModalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4caf50',
  },
  submitButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tableBadge: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tableBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  searchContainer: {
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  filteredResults: {
    padding: 10,
  },

  loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
errorContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  padding: 20,
},
errorText: {
  color: 'red',
  fontSize: 18,
  marginBottom: 20,
  textAlign: 'center',
},
retryButton: {
  backgroundColor: '#007bff',
  padding: 10,
  borderRadius: 5,
},
retryButtonText: {
  color: 'white',
  fontSize: 16,
},
categoryHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 15,
  backgroundColor: '#f8f9fa',
  borderBottomWidth: 1,
  borderBottomColor: '#dee2e6',
},
categoryTitle: {
  fontSize: 18,
  fontWeight: 'bold',
},
categoryToggle: {
  fontSize: 16,
  color: '#6c757d',
},
categoryItems: {
  paddingHorizontal: 15,
},

tableWithOrder: {
  borderWidth: 2,
  borderColor: '#ff9800',
},

activeOrderBadge: {
  backgroundColor: '#ff9800',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 12,
  marginTop: 8,
},

activeOrderText: {
  color: '#ffffff',
  fontSize: 12,
  fontWeight: '600',
},

activeOrderInfo: {
  backgroundColor: '#fff3e0',
  padding: 16,
  borderRadius: 8,
  marginBottom: 16,
  borderLeftWidth: 4,
  borderLeftColor: '#ff9800',
},

activeOrderTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#ff9800',
  marginBottom: 4,
},

activeOrderItems: {
  fontSize: 14,
  color: '#666',
},

activeOrderIndicator: {
  backgroundColor: '#ff9800',
  paddingHorizontal: 8,
  paddingVertical: 2,
  borderRadius: 8,
  marginLeft: 8,
},

activeOrderIndicatorText: {
  color: '#ffffff',
  fontSize: 12,
  fontWeight: '600',
},

emptyOrderContainer: {
  padding: 20,
  alignItems: 'center',
  justifyContent: 'center',
},

emptyOrderText: {
  fontSize: 16,
  color: '#999',
  fontStyle: 'italic',
},

orderModalActions: {
  flexDirection: 'column',
  gap: 8,
},

finalizeButton: {
  backgroundColor: '#4caf50',
  paddingVertical: 16,
  borderRadius: 8,
  alignItems: 'center',
},

finalizeButtonText: {
  color: '#ffffff',
  fontSize: 16,
  fontWeight: 'bold',
},

extraItemSelected: {
  backgroundColor: '#e3f2fd',
  borderColor: '#2196f3',
},

});

export default styles