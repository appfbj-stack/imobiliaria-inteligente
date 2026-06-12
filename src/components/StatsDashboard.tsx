import React, { useEffect, useState } from 'react';
import { DashboardStats } from '../types';
import { Home, Sparkles, TrendingUp, Users, Calendar, Inbox } from 'lucide-react';
import { motion } from 'motion/react';

interface StatsDashboardProps {
  stats: DashboardStats | null;
  loading: boolean;
}

export default function StatsDashboard({ stats, loading }: StatsDashboardProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 animate-pulse">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 bg-slate-100 rounded-2xl" />
        ))}
      </div>
    );
  }

  const data = stats || {
    totalProperties: 0,
    totalSold: 0,
    totalRented: 0,
    totalClients: 0,
    totalVisits: 0
  };

  const statItems = [
    {
      id: 'stat-total',
      label: 'Total de Imóveis',
      value: data.totalProperties,
      icon: Home,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100/60',
    },
    {
      id: 'stat-sold',
      label: 'Imóveis Vendidos',
      value: data.totalSold,
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100/60',
    },
    {
      id: 'stat-rented',
      label: 'Imóveis Alugados',
      value: data.totalRented,
      icon: Inbox,
      color: 'bg-amber-50 text-amber-600 border-amber-100/60',
    },
    {
      id: 'stat-clients',
      label: 'Clientes Cadastrados',
      value: data.totalClients,
      icon: Users,
      color: 'bg-sky-50 text-sky-600 border-sky-100/60',
    },
    {
      id: 'stat-visits',
      label: 'Agenda de Visitas',
      value: data.totalVisits,
      icon: Calendar,
      color: 'bg-rose-50 text-rose-600 border-rose-100/60',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {statItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={item.label}
            id={item.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            className={`p-5 rounded-2xl border ${item.color} bg-white/70 backdrop-blur-md shadow-xs flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.label}</span>
              <div className={`p-2 rounded-xl ${item.color.split(' ')[0]} ${item.color.split(' ')[1]}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div>
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {item.value}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
