// js/dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
    // Authentication protection is now handled by auth.js.
    // We just need to get the session to retrieve the user's data for our functions.
    const { data: { session }, error: sessionError } = await window.supabaseClient.auth.getSession();

    // This is a fallback. In theory, auth.js should prevent this code from ever running without a session.
    if (sessionError || !session) {
        console.error('Dashboard loaded without a valid session. This should have been prevented by auth.js.');
        const inventoryStatusEl = document.getElementById('inventory-status');
        if (inventoryStatusEl) inventoryStatusEl.textContent = 'Authentication error. Please try logging in again.';
        return; 
    }

    const user = session.user;
    console.log("Dashboard loaded for user:", user.email);

    const addItemForm = document.getElementById('addItemForm');
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    const itemFormStatusEl = document.getElementById('item-form-status');
    const inventoryStatusEl = document.getElementById('inventory-status');
    const searchInput = document.getElementById('searchInput');
    const refreshButton = document.getElementById('refreshInventory');

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
            showItemFormStatus('Adding item...', 'sending');
            const newItem = {
                name: document.getElementById('itemName').value,
                sku: document.getElementById('itemSku').value || null,
                description: document.getElementById('itemDescription').value || null,
                quantity: parseInt(document.getElementById('itemQuantity').value),
                category: document.getElementById('itemCategory').value || null,
                user_id: user.id // The user object is available here
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
            button.removeEventListener('click', handleDeleteClick);
            button.addEventListener('click', handleDeleteClick);
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
                alert(`Error: ${error.message}`);
            } else {
                fetchInventory(searchInput.value);
            }
        }
    }
    function handleEditClick(e) {
        const itemId = e.target.dataset.id;
        alert(`Edit item ID: ${itemId} - (Edit functionality not fully implemented yet)`);
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => fetchInventory(searchInput.value.trim()));
    }
    if (refreshButton) {
        refreshButton.addEventListener('click', () => fetchInventory(searchInput.value.trim()));
    }

    fetchInventory(); // Initial load
});