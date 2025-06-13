// js/dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
    // auth.js should have already run and redirected if not authenticated for dashboard.
    // We still re-check here for safety or if auth.js didn't complete redirect in time.
    const session = await window.checkAuthStateAndRedirect(true); // true means it's a protected page

    if (!session || !session.user) {
        // If somehow still here without a session, force redirect.
        // auth.js onAuthStateChange should ideally handle this.
        if (!window.location.pathname.endsWith('login.html')) { // Avoid redirect loop
            window.location.href = 'login.html';
        }
        return; // Stop further execution if no user
    }

    const user = session.user;
    console.log("Dashboard loaded for user:", user.email);
    // User email in header is now handled by auth.js's updateHeaderUI

    const addItemForm = document.getElementById('addItemForm');
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    const itemFormStatusEl = document.getElementById('item-form-status');
    const inventoryStatusEl = document.getElementById('inventory-status');
    const searchInput = document.getElementById('searchInput');
    const refreshButton = document.getElementById('refreshInventory');
    // Logout button in header is handled by auth.js, but if you have one specifically in dashboard content:
    // const logoutButtonContent = document.getElementById('logoutButtonContent');
    // if(logoutButtonContent) logoutButtonContent.addEventListener('click', window.handleLogout);


    function showItemFormStatus(message, type = 'error') {
        if (itemFormStatusEl) {
            itemFormStatusEl.textContent = message;
            itemFormStatusEl.className = `form-status ${type} visible`;
            setTimeout(() => {
                 if(itemFormStatusEl) itemFormStatusEl.className = 'form-status';
            }, 3000);
        }
    }
     function showInventoryStatus(message) {
        if (inventoryStatusEl) {
            inventoryStatusEl.textContent = message;
        }
    }

    async function fetchInventory(searchTerm = '') {
        showInventoryStatus('Loading inventory...');
        if (!inventoryTableBody) {
             console.error("inventoryTableBody not found!");
             showInventoryStatus('Error: Table body element missing.');
             return;
        }
        inventoryTableBody.innerHTML = '';

        let query = window.supabaseClient.from('inventory').select('*');
        if (searchTerm) {
            query = query.or(`name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`);
        }
        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching inventory:', error);
            showInventoryStatus(`Error: ${error.message}`);
            return;
        }

        if (data && data.length > 0) {
            showInventoryStatus('');
            data.forEach(item => {
                const row = inventoryTableBody.insertRow();
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.sku || '-'}</td>
                    <td>${item.quantity}</td>
                    <td>${item.category || '-'}</td>
                    <td>${item.description || '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-edit" data-id="${item.id}">Edit</button>
                        <button class="btn btn-sm btn-danger btn-delete" data-id="${item.id}">Delete</button>
                    </td>
                `;
            });
        } else {
            showInventoryStatus(searchTerm ? 'No items match your search.' : 'No inventory items found. Add some!');
        }
        addTableEventListeners();
    }

    if (addItemForm) {
        addItemForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            if (!user) { // Safety check
                showItemFormStatus('Error: Not logged in.');
                return;
            }
            showItemFormStatus('Adding item...', 'sending');
            const newItem = {
                name: document.getElementById('itemName').value,
                sku: document.getElementById('itemSku').value || null,
                description: document.getElementById('itemDescription').value || null,
                quantity: parseInt(document.getElementById('itemQuantity').value),
                category: document.getElementById('itemCategory').value || null,
                user_id: user.id
            };

            const { data, error } = await window.supabaseClient.from('inventory').insert([newItem]).select();
            if (error) {
                console.error('Error adding item:', error);
                showItemFormStatus(`Error: ${error.message}`);
            } else {
                showItemFormStatus('Item added successfully!', 'success');
                addItemForm.reset();
                fetchInventory(searchInput.value);
            }
        });
    }

    function addTableEventListeners() {
        if (!inventoryTableBody) return;
        inventoryTableBody.querySelectorAll('.btn-delete').forEach(button => {
            button.removeEventListener('click', handleDeleteClick); // Remove old listener
            button.addEventListener('click', handleDeleteClick);    // Add new one
        });
        inventoryTableBody.querySelectorAll('.btn-edit').forEach(button => {
             button.removeEventListener('click', handleEditClick);
            button.addEventListener('click', handleEditClick);
        });
    }
    async function handleDeleteClick(e) {
        const itemId = e.target.dataset.id;
        if (confirm('Are you sure you want to delete this item?')) {
            const { error } = await window.supabaseClient.from('inventory').delete().match({ id: itemId });
            if (error) {
                console.error('Error deleting item:', error);
                alert(`Error: ${error.message}`);
            } else {
                fetchInventory(searchInput.value);
            }
        }
    }
    function handleEditClick(e) {
        const itemId = e.target.dataset.id;
        alert(`Edit item ID: ${itemId} - (Edit functionality not fully implemented yet)`);
        // TODO: Implement edit functionality
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => fetchInventory(searchInput.value.trim()));
    }
    if (refreshButton) {
        refreshButton.addEventListener('click', () => fetchInventory(searchInput.value.trim()));
    }

    fetchInventory(); // Initial load
});