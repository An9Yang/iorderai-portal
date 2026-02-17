import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { mockOrders, getFinanceStats, mockDailyStats } from '../../mock/data';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const todayStats = getFinanceStats('today');
  const pendingOrders = mockOrders.filter(o => o.status === 'pending');

  const statCards = [
    {
      title: t('dashboard.todayOrders'),
      value: todayStats.orderCount,
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      color: 'blue',
      link: '/orders',
    },
    {
      title: t('dashboard.todayRevenue'),
      value: `$${todayStats.totalAmount.toFixed(2)}`,
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'green',
      link: '/finance',
    },
    {
      title: t('dashboard.pendingOrders'),
      value: pendingOrders.length,
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'orange',
      link: '/orders?status=pending',
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'bg-blue-500' },
    green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'bg-green-500' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'bg-orange-500' },
  };

  return (
    <div className="space-y-6">
      {/* Welcome message */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">{t('dashboard.welcome')}</h1>
        <p className="text-gray-500 mt-1">{new Date().toLocaleDateString()}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {statCards.map((card) => (
          <Link
            key={card.link}
            to={card.link}
            className={`${colorMap[card.color].bg} rounded-xl p-6 transition-transform hover:scale-[1.02]`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className={`text-3xl font-bold mt-2 ${colorMap[card.color].text}`}>
                  {card.value}
                </p>
              </div>
              <div className={`${colorMap[card.color].icon} p-3 rounded-xl`}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Weekly trend chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('dashboard.weeklyTrend')}</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockDailyStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#3b82f6"
                fill="#93c5fd"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent pending orders */}
      {pendingOrders.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">{t('dashboard.pendingOrders')}</h2>
            <Link to="/orders?status=pending" className="text-blue-500 text-sm hover:underline">
              {t('orders.viewDetails')} →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-gray-500 border-b">
                  <th className="pb-3 font-medium">{t('orders.orderId')}</th>
                  <th className="pb-3 font-medium">{t('orders.customerPhone')}</th>
                  <th className="pb-3 font-medium">{t('orders.orderType')}</th>
                  <th className="pb-3 font-medium">{t('orders.total')}</th>
                  <th className="pb-3 font-medium">{t('orders.createdAt')}</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="border-b last:border-0">
                    <td className="py-3 text-sm font-medium text-blue-600">{order.id}</td>
                    <td className="py-3 text-sm text-gray-600">{order.customerPhone}</td>
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.orderType === 'delivery'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {order.orderType === 'delivery' ? t('orders.delivery') : t('orders.pickup')}
                      </span>
                    </td>
                    <td className="py-3 text-sm font-medium text-gray-800">${order.total.toFixed(2)}</td>
                    <td className="py-3 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
