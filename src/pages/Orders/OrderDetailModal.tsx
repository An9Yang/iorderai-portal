import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Order } from '../../types';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
  const { t } = useTranslation();

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    const labels: Record<string, string> = {
      pending: t('orders.statusPending'),
      completed: t('orders.statusCompleted'),
      cancelled: t('orders.statusCancelled'),
    };
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />

        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{t('orders.orderDetails')}</h2>
              <p className="text-sm text-gray-500">{order.id}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Order info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">{t('orders.orderStatus')}</p>
                <div className="mt-1">{getStatusBadge(order.status)}</div>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('orders.orderType')}</p>
                <p className="mt-1 font-medium">
                  {order.orderType === 'delivery' ? t('orders.delivery') : t('orders.pickup')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('orders.customerPhone')}</p>
                <p className="mt-1 font-medium">{order.customerPhone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('orders.createdAt')}</p>
                <p className="mt-1 font-medium">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('orders.paymentMethod')}</p>
                <p className="mt-1 font-medium">
                  {order.paymentMethod === 'card' ? t('orders.card') : t('orders.cash')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">{t('orders.paymentStatus')}</p>
                <p className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    order.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : order.paymentStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {order.paymentStatus === 'paid'
                      ? t('orders.paid')
                      : order.paymentStatus === 'pending'
                      ? t('orders.pending')
                      : t('orders.failed')}
                  </span>
                </p>
              </div>
            </div>

            {/* Delivery address */}
            {order.orderType === 'delivery' && order.deliveryAddress && (
              <div>
                <p className="text-sm text-gray-500">{t('orders.deliveryAddress')}</p>
                <p className="mt-1 font-medium">{order.deliveryAddress}</p>
              </div>
            )}

            {/* Order notes */}
            {order.notes && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                  <div>
                    <p className="text-sm text-amber-700 font-medium">{t('orders.orderNotes')}</p>
                    <p className="text-sm text-amber-900 mt-1">{order.notes}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Cancel reason */}
            {order.status === 'cancelled' && order.cancelReason && (
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600 font-medium">{t('orders.cancelReason')}</p>
                <p className="text-sm text-red-700 mt-1">{order.cancelReason}</p>
              </div>
            )}

            {/* Order items */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">{t('orders.items')}</h3>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 uppercase">
                      <th className="px-4 py-2">{t('orders.items')}</th>
                      <th className="px-4 py-2 text-center">{t('orders.quantity')}</th>
                      <th className="px-4 py-2 text-right">{t('orders.unitPrice')}</th>
                      <th className="px-4 py-2 text-right">{t('orders.itemTotal')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm">{item.name}</td>
                        <td className="px-4 py-3 text-sm text-center">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-right">${item.price.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order summary */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('orders.subtotal')}</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              {order.orderType === 'delivery' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('orders.deliveryFee')}</span>
                  <span>${order.deliveryFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('orders.tax')}</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
              {order.tips > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('orders.tips')}</span>
                  <span>${order.tips.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold pt-2 border-t">
                <span>{t('orders.total')}</span>
                <span className="text-blue-600">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
            <button
              onClick={onClose}
              className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
            >
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
