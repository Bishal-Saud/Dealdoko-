import React from 'react';
import { useCart } from '../context/CartContext';
import { X, Trash2, ShoppingBag } from 'lucide-react';

export default function CartPopup() {
  const { cart, removeFromCart, isOpen, setIsOpen } = useCart();

  const handleCheckout = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return toast.error("Please login to checkout");

  const productIds = cart.map(item => item.id);
  const total = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);

  const { error } = await supabase
    .from('orders')
    .insert([{ 
      user_id: user.id, 
      product_ids: productIds, 
      total_price: total 
    }]);

  if (error) {
    toast.error("Order failed!");
  } else {
    toast.success("Order placed successfully!");
    setCart([]); // Clear local cart
    localStorage.removeItem('my-cart'); // Clear storage
    setIsOpen(false);
  }
};
  if (!isOpen) return null;

  const total = cart.reduce((sum, item) => sum + parseFloat(item.price), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-black">Your Selection</h2>
          <button onClick={() => setIsOpen(false)}><X size={20}/></button>
        </div>

        <div className="space-y-4 max-h-60 overflow-y-auto">
          {cart.length === 0 ? <p className="text-center text-gray-400">Cart is empty</p> : 
            cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl">
                <div className='flex gap-3 items-center'>
                    <img src={item.image_url} className='w-10 h-10 rounded-lg object-cover' />
                    <div>
                        <p className="text-xs font-bold">{item.title}</p>
                        <p className="text-[10px] text-gray-500">Rs. {item.price}</p>
                    </div>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-red-400"><Trash2 size={16}/></button>
              </div>
            ))
          }
        </div>

        {cart.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between font-black mb-4">
              <span>Total</span>
              <span>Rs. {total.toLocaleString()}</span>
            </div>
            <button onClick={handleCheckout} className="w-full py-3 bg-blue-600 text-white ...">
  Checkout Now
</button>
          </div>
        )}
      </div>
    </div>
  );
}