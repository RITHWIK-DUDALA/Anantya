import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { SpotlightNavbar } from '../components/SpotlightNavbar';

const SNACK_CATEGORIES = [
  {
    id: 'goli_soda',
    category: 'Goli Soda',
    price: 50,
    items: ['Blue Berry', 'Green Apple', 'Strawberry', 'Lichi', 'Lime']
  },
  {
    id: 'lays',
    category: 'Lays',
    price: 20,
    items: ['Magic Masala', 'Classic Salted', 'American Style Cream & Onion', 'Spanish Tomato Tango']
  },
  {
    id: 'milk_yogurt',
    category: 'Milk / Yogurt',
    price: 40,
    items: ['Yogurt Blueberry', 'Cottage Cheese', 'Vanilla', 'Normal', 'Strawberry']
  },
  {
    id: 'ice_creams_cones',
    category: 'Ice Creams (Cones)',
    price: 60,
    items: ['Strawberry', 'Chocolate', 'Vanilla', 'Blueberry', 'Badam Pista']
  },
  {
    id: 'ice_creams_bars',
    category: 'Ice Creams (Bars)',
    price: 60,
    items: ['Grape', 'Mango', 'Strawberry Candy', 'Orange Candy']
  },
  {
    id: 'soft_drinks',
    category: 'Soft Drinks',
    price: 70,
    items: ['Chocolate Milk Shake', 'Vanilla Milk Shake', 'Strawberry Milk Shake', 'Appy Fizz']
  }
];

export default function SnacksSelectionPage() {
  const { showtimeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { selectedSeats = [], totalAmount = 0, showData = null } = location.state || {};
  
  const [cart, setCart] = useState({}); // { "goli_soda_Blue Berry": { quantity: 1, price: 50, name: "Goli Soda - Blue Berry" } }

  useEffect(() => {
    if (selectedSeats.length === 0) {
      navigate(`/movies/${showtimeId}/seats`);
      return;
    }
  }, [selectedSeats, navigate, showtimeId]);

  const updateCart = (categoryId, itemName, price, categoryName, delta) => {
    const key = `${categoryId}_${itemName}`;
    setCart(prev => {
      const existing = prev[key] || { quantity: 0, price, name: `${categoryName} - ${itemName}` };
      const newQuantity = existing.quantity + delta;
      
      if (newQuantity <= 0) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      
      return {
        ...prev,
        [key]: {
          ...existing,
          quantity: newQuantity
        }
      };
    });
  };

  const getQuantity = (categoryId, itemName) => {
    const key = `${categoryId}_${itemName}`;
    return cart[key]?.quantity || 0;
  };

  const snacksTotal = Object.values(cart).reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const grandTotal = totalAmount + snacksTotal;

  const handleProceed = () => {
    const snacksArray = Object.values(cart).map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity
    }));
    
    navigate(`/movies/${showtimeId}/checkout`, { 
      state: { 
        selectedSeats, 
        seatAmount: totalAmount,
        snacksAmount: snacksTotal,
        totalAmount: grandTotal, 
        snacks: snacksArray,
        showData 
      } 
    });
  };

  const handleSkip = () => {
    navigate(`/movies/${showtimeId}/checkout`, { 
      state: { 
        selectedSeats, 
        seatAmount: totalAmount,
        snacksAmount: 0,
        totalAmount, 
        snacks: [],
        showData 
      } 
    });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', paddingBottom: '140px' }}>
      <SpotlightNavbar />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '100px', paddingLeft: '20px', paddingRight: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', margin: 0, color: 'var(--primary-dark)' }}>
              Grab Some Snacks!
            </h1>
            <p style={{ color: 'var(--text-muted)', margin: '5px 0 0 0' }}>
              Pre-order your snacks and skip the queue.
            </p>
          </div>
          <button 
            onClick={handleSkip}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Skip Snacks
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {SNACK_CATEGORIES.map(category => (
            <div key={category.id} style={{ background: 'var(--surface)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
                <h3 style={{ margin: 0, color: 'var(--primary)', fontSize: '1.2rem' }}>{category.category}</h3>
                <span style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>₹{category.price}</span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {category.items.map(item => (
                  <div key={item} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.95rem' }}>{item}</span>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-alt)', borderRadius: '8px', padding: '4px' }}>
                      <button 
                        onClick={() => updateCart(category.id, item, category.price, category.category, -1)}
                        disabled={getQuantity(category.id, item) === 0}
                        style={{ 
                          width: '28px', height: '28px', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: getQuantity(category.id, item) > 0 ? 'var(--surface)' : 'transparent', 
                          border: 'none', borderRadius: '6px', 
                          color: getQuantity(category.id, item) > 0 ? 'var(--text)' : 'var(--text-muted)',
                          cursor: getQuantity(category.id, item) > 0 ? 'pointer' : 'not-allowed',
                          fontSize: '1.2rem', fontWeight: 'bold'
                        }}
                      >-</button>
                      
                      <span style={{ width: '20px', textAlign: 'center', fontWeight: 'bold' }}>
                        {getQuantity(category.id, item)}
                      </span>
                      
                      <button 
                        onClick={() => updateCart(category.id, item, category.price, category.category, 1)}
                        style={{ 
                          width: '28px', height: '28px', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'var(--primary)', 
                          border: 'none', borderRadius: '6px', 
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: '1.2rem', fontWeight: 'bold'
                        }}
                      >+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Bar */}
      <div style={{ 
        position: 'fixed', 
        bottom: '20px', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        background: 'var(--surface-glass)', 
        backdropFilter: 'blur(10px)',
        border: '1px solid var(--border)',
        padding: '20px 30px', 
        borderRadius: '16px', 
        display: 'flex', 
        gap: '40px',
        alignItems: 'center',
        boxShadow: 'var(--shadow-xl)',
        zIndex: 100,
        width: 'max-content',
        maxWidth: '95vw'
      }}>
        <div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Seats ({selectedSeats.length})
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text)' }}>
            ₹{totalAmount}
          </div>
        </div>
        
        <div style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>+</div>
        
        <div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            Snacks
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--text)' }}>
            ₹{snacksTotal}
          </div>
        </div>

        <div style={{ width: '1px', height: '40px', background: 'var(--border)' }}></div>
        
        <div>
          <div style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '4px' }}>Grand Total</div>
          <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'var(--primary-dark)' }}>₹{grandTotal}</div>
        </div>

        <button 
          onClick={handleProceed}
          style={{
            padding: '12px 30px',
            background: 'var(--primary)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '1rem',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          Continue to Checkout
        </button>
      </div>
    </div>
  );
}
