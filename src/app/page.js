'use client'; // Ensure this is at the top of the file

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Stack, Typography, IconButton, Modal, TextField, Collapse, Button } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { auth, firestore } from '@/firebase';
import { collection, doc, getDocs, query, setDoc, updateDoc, increment, getDoc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
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

  const addItem = async (name) => {
    if (name && user) {
      const itemRef = doc(firestore, 'users', user.uid, 'inventory', name);
      const itemDoc = await getDoc(itemRef);

      if (itemDoc.exists()) {
        await updateDoc(itemRef, { quantity: increment(1) });
      } else {
        await setDoc(itemRef, { quantity: 1 });
      }
      fetchInventory(user.uid);
    }
  };

  const removeItem = async (name, quantity) => {
    if (name && quantity > 0 && user) {
      const itemRef = doc(firestore, 'users', user.uid, 'inventory', name);
      const itemDoc = await getDoc(itemRef);

      if (itemDoc.exists()) {
        const currentQuantity = itemDoc.data().quantity;
        if (quantity >= currentQuantity) {
          await deleteDoc(itemRef);
        } else {
          await updateDoc(itemRef, { quantity: increment(-quantity) });
        }
        fetchInventory(user.uid);
      }
      handleClose();
    }
  };

  const toggleCollapse = () => {
    setCollapse(prev => !prev);
  };

  const handleRemove = (item) => {
    setSelectedItem(item);
    setRemoveQuantity(0);
    handleOpen();
  };

  const increaseQuantity = () => {
    if (removeQuantity < (selectedItem?.quantity || 0)) {
      setRemoveQuantity(prev => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (removeQuantity > 0) {
      setRemoveQuantity(prev => prev - 1);
    }
  };

  const filteredInventory = inventory.filter(({ name }) =>
    name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      flexDirection={'row'}
    >
      {/* Left side for the collapsible list */}
      <Box
        width="20%"
        height="100%"
        bgcolor={'#8B4513'}
        borderRight={'1px solid #333'}
        display={'flex'}
        flexDirection={'column'}
        padding={2}
        position="relative"
      >
        <Typography
          variant="h4"
          sx={{ padding: '16px', bgcolor: '#A0522D', color: 'white', textAlign: 'center' }}
        >
          Inventory
        </Typography>
        <Collapse in={collapse}>
          <Stack spacing={2} padding={2}>
            {filteredInventory.map(({ name, quantity }) => (
              <Box
                key={name}
                display={'flex'}
                justifyContent={'space-between'}
                alignItems={'center'}
                bgcolor={'#F5F5DC'}
                paddingX={2}
                paddingY={1}
                borderRadius={'25px'}
                sx={{ boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)', minHeight: '60px', position: 'relative' }}
              >
                <Box>
                  <Typography variant={'h6'} color={'#333'}>
                    {name.charAt(0).toUpperCase() + name.slice(1)}
                  </Typography>
                  <Typography variant={'body1'} color={'#333'}>
                    Quantity: {quantity}
                  </Typography>
                </Box>
                <IconButton
                  color="error"
                  onClick={() => handleRemove({ name, quantity })}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                >
                  <CancelIcon />
                </IconButton>
              </Box>
            ))}
          </Stack>
        </Collapse>
        <IconButton
          color="primary"
          onClick={handleOpen}
          sx={{
            position: 'absolute',
            bottom: 16,
            right: 16,
            backgroundColor: '#D2691E',
            color: 'white',
            '&:hover': {
              backgroundColor: '#CD853F',
            },
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
          }}
        >
          <AddCircleOutlineIcon fontSize="large" />
        </IconButton>
      </Box>

      {/* Right side for adding items */}
      <Box
        width="80%"
        height="100vh"
        display={'flex'}
        flexDirection={'column'}
        alignItems={'center'}
        gap={2}
        sx={{
          backgroundColor: 'transparent',
          backgroundImage: `url('/images/background.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <Typography
          variant="h4"
          sx={{ marginBottom: '16px', color: '#fff' }}
        >
          Welcome to Diego&apos;s Food Pantry
        </Typography>
        <TextField
          id="search-bar"
          label="Search Inventory"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            marginBottom: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '30px',
            color: 'black',
            input: {
              color: 'black',
            },
          }}
        />
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            {selectedItem ? (
              <Box>
                <Typography variant="body1" color={'#000'}>
                  Current Quantity: {selectedItem.quantity}
                </Typography>
                <Typography variant="body2" sx={{ marginBottom: 2 }} color={'#000'}>
                  How much would you like to remove?
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <IconButton onClick={decreaseQuantity} disabled={removeQuantity <= 0}>
                    <ExpandLessIcon />
                  </IconButton>
                  <Typography>{removeQuantity}</Typography>
                  <IconButton onClick={increaseQuantity} disabled={removeQuantity >= selectedItem.quantity}>
                    <ExpandMoreIcon />
                  </IconButton>
                </Stack>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => removeItem(selectedItem.name, removeQuantity)}
                  sx={{ marginTop: 2 }}
                >
                  Remove Item
                </Button>
              </Box>
            ) : (
              <Box>
                <TextField
                  label="Item Name"
                  variant="outlined"
                  fullWidth
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  margin="normal"
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => addItem(itemName)}
                >
                  Add Item
                </Button>
              </Box>
            )}
          </Box>
        </Modal>
      </Box>
    </Box>
  );
}
