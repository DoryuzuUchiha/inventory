'use client'; // Ensures this component only renders on the client-side

import { useState, useEffect } from 'react';
import { Box, Stack, Typography, IconButton, Modal, TextField, Collapse, Button } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import dynamic from 'next/dynamic';
import { collection, doc, getDocs, query, setDoc, updateDoc, increment, getDoc, deleteDoc } from 'firebase/firestore';

// Import client-side Firebase functions dynamically
const firestore = dynamic(() => import('@/firebase').then(mod => mod.firestore), { ssr: false });

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [collapse, setCollapse] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [removeQuantity, setRemoveQuantity] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchInventory = async () => {
      const firestoreClient = (await import('@/firebase')).firestore; // Ensure dynamic import of firestore
      const snapshot = query(collection(firestoreClient, 'inventory'));
      const docs = await getDocs(snapshot);
      const inventoryList = docs.docs.map(doc => ({ name: doc.id, ...doc.data() }));
      setInventory(inventoryList);
    };
    fetchInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedItem(null);
    setRemoveQuantity(0);
  };

  const addItem = async (name) => {
    if (name) {
      const firestoreClient = (await import('@/firebase')).firestore; // Ensure dynamic import of firestore
      const itemRef = doc(firestoreClient, 'inventory', name);
      const itemDoc = await getDoc(itemRef);

      if (itemDoc.exists()) {
        await updateDoc(itemRef, { quantity: increment(1) });
      } else {
        await setDoc(itemRef, { quantity: 1 });
      }
      updateInventory();
    }
  };

  const removeItem = async (name, quantity) => {
    if (name && quantity > 0) {
      const firestoreClient = (await import('@/firebase')).firestore; // Ensure dynamic import of firestore
      const itemRef = doc(firestoreClient, 'inventory', name);
      const itemDoc = await getDoc(itemRef);

      if (itemDoc.exists()) {
        const currentQuantity = itemDoc.data().quantity;
        if (quantity >= currentQuantity) {
          await deleteDoc(itemRef);
        } else {
          await updateDoc(itemRef, { quantity: increment(-quantity) });
        }
        updateInventory();
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

  const updateInventory = async () => {
    const firestoreClient = (await import('@/firebase')).firestore; // Ensure dynamic import of firestore
    const snapshot = query(collection(firestoreClient, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = docs.docs.map(doc => ({ name: doc.id, ...doc.data() }));
    setInventory(inventoryList);
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
          backgroundImage: `url('/images/background.JPG')`,
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
                  <Typography variant="h6" sx={{ color: '#000' }}>
                    {removeQuantity}
                  </Typography>
                  <IconButton onClick={increaseQuantity} disabled={removeQuantity >= (selectedItem?.quantity || 0)}>
                    <ExpandMoreIcon />
                  </IconButton>
                </Stack>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => removeItem(selectedItem.name, removeQuantity)}
                >
                  Remove
                </Button>
              </Box>
            ) : (
              <Stack width="100%" direction={'row'} spacing={2}>
                <TextField
                  id="outlined-basic"
                  label="Item"
                  variant="outlined"
                  fullWidth
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => addItem(itemName)}
                >
                  Add Item
                </Button>
              </Stack>
            )}
          </Box>
        </Modal>
      </Box>
    </Box>
  );
}
