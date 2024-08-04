'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Stack, Typography, IconButton, Modal, TextField, Collapse, Button, Menu, MenuItem } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { auth, firestore } from '@/firebase';
import { collection, doc, getDocs, query, setDoc, updateDoc, increment, getDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%',
  maxWidth: '500px',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: '10px',
  backgroundImage: 'url("/images/wooden-texture.jpg")', // Rustic wood texture
  backgroundSize: 'cover',
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [collapse, setCollapse] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [removeQuantity, setRemoveQuantity] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [accountInfoOpen, setAccountInfoOpen] = useState(false);
const [accountInfo, setAccountInfo] = useState({ email: '', maskedPassword: '', totalItems: 0, uniqueItems: 0 });
  const [anchorEl, setAnchorEl] = useState(null); // State for menu anchor
  const openMenu = Boolean(anchorEl);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchInventory(currentUser.uid);
      } else {
        router.push('/signin'); // Client-side navigation
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchInventory = async (userId) => {
    const userInventoryRef = collection(firestore, 'users', userId, 'inventory');
    const snapshot = await getDocs(query(userInventoryRef));
    const inventoryList = snapshot.docs.map(doc => ({ name: doc.id, ...doc.data() }));
    setInventory(inventoryList);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedItem(null);
    setRemoveQuantity(0);
  };

  const handleAddItem = async () => {
    const userInventoryRef = doc(firestore, 'users', user.uid, 'inventory', itemName);

    try {
      const itemSnapshot = await getDoc(userInventoryRef);

      if (itemSnapshot.exists()) {
        await updateDoc(userInventoryRef, {
          quantity: increment(1),
        });
      } else {
        await setDoc(userInventoryRef, {
          quantity: 1,
        });
      }
      fetchInventory(user.uid);
    } catch (err) {
      console.error('Error adding item:', err);
    } finally {
      setItemName('');
      handleClose();
    }
  };

  const handleRemoveItem = async () => {
    if (!selectedItem) return;

    const userInventoryRef = doc(firestore, 'users', user.uid, 'inventory', selectedItem.name);

    try {
      const newQuantity = selectedItem.quantity - removeQuantity;
      if (newQuantity > 0) {
        await updateDoc(userInventoryRef, {
          quantity: newQuantity,
        });
      } else {
        await deleteDoc(userInventoryRef);
      }
      fetchInventory(user.uid);
    } catch (err) {
      console.error('Error removing item:', err);
    } finally {
      handleClose();
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleCollapseToggle = () => {
    setCollapse(!collapse);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/signin');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };
  
  const handleAccountInfo = async () => {
    if (user) {
      const userInventoryRef = collection(firestore, 'users', user.uid, 'inventory');
      const snapshot = await getDocs(query(userInventoryRef));
      const inventoryList = snapshot.docs.map(doc => doc.data());
  
      const totalItems = inventoryList.reduce((total, item) => total + item.quantity, 0);
      const uniqueItems = inventoryList.length;
  
      setAccountInfo({
        email: user.email,
        maskedPassword: '*'.repeat(8),
        totalItems,
        uniqueItems,
      });
      setAccountInfoOpen(true);
    }
  };
  const handleDeleteAccount = async () => {
    if (user) {
      try {
        // Delete user data from Firestore
        await deleteDoc(doc(firestore, 'users', user.uid));
        
        // Delete user from Firebase Authentication
        await user.delete();
        
        // Sign out the user and redirect to sign-in page
        await signOut(auth);
        router.push('/signin');
      } catch (error) {
        console.error("Error deleting account:", error);
        // Handle specific errors (e.g., if the user is not logged in)
      }
    }
  };
  

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      sx={{
        height: '100vh',
        backgroundImage: `url('/images/sibackground.JPG')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'multiply',
        backgroundColor: 'rgba(139,69,19, 0.7)', // Dark overlay for rustic feel
        color: '#fff',
        padding: 2,
        overflowY: 'auto',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ marginBottom: 3 }}>
        <Typography variant="h4" sx={{ fontFamily: 'Georgia, serif' }}>
          Pantry Inventory
        </Typography>
        <IconButton onClick={handleMenuOpen} color="inherit">
          <AccountCircleIcon fontSize="large" />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={openMenu}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleAccountInfo}>Account Info</MenuItem>
          <MenuItem onClick={handleSignOut}>Sign Out</MenuItem>
          <MenuItem onClick={handleDeleteAccount} sx={{ color: 'red' }}>
            Delete Account
          </MenuItem>
        </Menu>
      </Stack>

      <TextField
        label="Search Items"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={handleSearch}
        sx={{
          marginBottom: 3,
          backgroundColor: 'white',
          borderRadius: '5px',
        }}
      />

      <Stack direction="row" alignItems="center" onClick={handleCollapseToggle} sx={{ cursor: 'pointer', marginBottom: 2 }}>
        <Typography variant="h6" sx={{ fontFamily: 'Georgia, serif' }}>
          Inventory
        </Typography>
        {collapse ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      </Stack>

      <Collapse in={collapse} timeout="auto" unmountOnExit>
        <Stack spacing={2}>
          {filteredInventory.map((item) => (
            <Box
              key={item.name}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '10px',
                padding: '10px 15px',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Typography variant="body1" sx={{ fontFamily: 'Georgia, serif', color: '#333' }}>
                {item.name} - {item.quantity}
              </Typography>
              <Stack direction="row" spacing={1}>
                <IconButton onClick={() => { setSelectedItem(item); setOpen(true); }} color="inherit">
                  <CancelIcon />
                </IconButton>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Collapse>

      <IconButton
        onClick={handleOpen}
        sx={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          backgroundColor: '#8B4513',
          color: '#fff',
          '&:hover': { backgroundColor: '#A0522D' },
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          padding: '15px',
        }}
      >
        <AddCircleOutlineIcon fontSize="large" />
      </IconButton>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          {selectedItem ? (
            <>
              <Typography id="modal-modal-title" variant="h5" component="h2" sx={{ marginBottom: 2, color: '#000', fontFamily: 'Georgia, serif' }}>
                Remove Item
              </Typography>
              <Typography sx={{ color: '#000', marginBottom: 2, fontFamily: 'Georgia, serif' }}>
                Current Quantity: {selectedItem.quantity}
              </Typography>
              <TextField
                label="How much would you like to remove?"
                variant="outlined"
                fullWidth
                type="number"
                value={removeQuantity}
                onChange={(e) => setRemoveQuantity(Number(e.target.value))}
                sx={{ marginBottom: 2, backgroundColor: 'white' }}
              />
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#8B4513',
                  '&:hover': { bgcolor: '#A0522D' },
                  color: '#fff',
                  fontFamily: 'Cursive, sans-serif',
                }}
                onClick={handleRemoveItem}
              >
                Remove
              </Button>
            </>
          ) : (
            <>
              <Typography id="modal-modal-title" variant="h5" component="h2" sx={{ marginBottom: 2, color: '#000', fontFamily: 'Georgia, serif' }}>
                Add Item
              </Typography>
              <TextField
                label="Item Name"
                variant="outlined"
                fullWidth
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                sx={{ marginBottom: 2, backgroundColor: 'white' }}
              />
              <Button
                variant="contained"
                sx={{
                  bgcolor: '#8B4513',
                  '&:hover': { bgcolor: '#A0522D' },
                  color: '#fff',
                  fontFamily: 'Cursive, sans-serif',
                }}
                onClick={handleAddItem}
              >
                Add
              </Button>
            </>
          )}
        </Box>
      </Modal>
      <Modal open={accountInfoOpen} onClose={() => setAccountInfoOpen(false)}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          bgcolor="rgba(255, 255, 255, 0.95)"
          padding={4}
          borderRadius={3}
          sx={{ width: '90%', maxWidth: '450px', margin: 'auto', marginTop: '10%', background: 'url(/images/wooden-texture.jpg) center/cover' }}
        >
          <Typography variant="h5" sx={{ marginBottom: 2, color: '#FFFFFF' }}>
            Account Information
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: 1, color: '#FFFFFF' }}>
            Email: {accountInfo.email}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: 1, color: '#FFFFFF' }}>
            Password: {accountInfo.maskedPassword}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: 1, color: '#FFFFFF' }}>
            Total Items: {accountInfo.totalItems}
          </Typography>
          <Typography variant="body1" sx={{ color: '#FFFFFF' }}>
            Unique Items: {accountInfo.uniqueItems}
          </Typography>
        </Box>
      </Modal>
    </Box>
  );
}

