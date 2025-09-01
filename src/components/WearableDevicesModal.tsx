import React, { useState } from 'react';
import {
  Smartphone,
  Watch,
  Battery,
  Wifi,
  WifiOff,
  Settings,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Timer,
  Bell,
  Calendar,
  X
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useSettings } from '../store/settings';

interface WearableDevicesModalProps {
  open: boolean;
  onClose: () => void;
}

const WearableDevicesModal: React.FC<WearableDevicesModalProps> = ({ open, onClose }) => {
  const {
    wearableDevices,
    addWearableDevice,
    updateWearableDevice,
    deleteWearableDevice,
    connectWearableDevice,
    disconnectWearableDevice,
    syncWearableDevice,
  } = useSettings();

  const [connecting, setConnecting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [newDevice, setNewDevice] = useState({
    name: '',
    provider: 'apple-watch' as const,
    model: '',
  });

  const getProviderIcon = (provider: 'apple-watch' | 'fitbit' | 'samsung') => {
    switch (provider) {
      case 'apple-watch':
        return <Watch size={20} />;
      case 'fitbit':
        return <Smartphone size={20} />;
      case 'samsung':
        return <Watch size={20} />;
      default:
        return <Smartphone size={20} />;
    }
  };

  const getProviderColor = (provider: 'apple-watch' | 'fitbit' | 'samsung') => {
    switch (provider) {
      case 'apple-watch':
        return '#007AFF';
      case 'fitbit':
        return '#00BF6F';
      case 'samsung':
        return '#1428A0';
      default:
        return '#666666';
    }
  };

  const getProviderName = (provider: 'apple-watch' | 'fitbit' | 'samsung') => {
    switch (provider) {
      case 'apple-watch':
        return 'Apple Watch';
      case 'fitbit':
        return 'Fitbit';
      case 'samsung':
        return 'Samsung Galaxy Watch';
      default:
        return 'Wearable Device';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return '#34C759';
    if (level > 20) return '#FF9500';
    return '#FF3B30';
  };

  const getBatteryIcon = (level: number) => {
    if (level > 50) return '🔋';
    if (level > 20) return '🪫';
    return '🔋';
  };

  const handleConnect = async (deviceId: string) => {
    setConnecting(deviceId);
    try {
      const success = await connectWearableDevice(deviceId);
      if (success) {
        // Success handled by store
      }
    } catch (error) {
      console.error('Failed to connect device:', error);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = (deviceId: string) => {
    disconnectWearableDevice(deviceId);
  };

  const handleSync = async (deviceId: string) => {
    setSyncing(deviceId);
    try {
      const success = await syncWearableDevice(deviceId);
      if (success) {
        // Success handled by store
      }
    } catch (error) {
      console.error('Failed to sync device:', error);
    } finally {
      setSyncing(null);
    }
  };

  const handleAddDevice = () => {
    if (newDevice.name && newDevice.model) {
      addWearableDevice({
        name: newDevice.name,
        provider: newDevice.provider,
        model: newDevice.model,
        isConnected: false,
        lastSync: null,
        syncEnabled: true,
        syncFrequency: 'realtime',
        batteryLevel: 100,
        syncFeatures: {
          pomodoro: true,
          notifications: true,
          newTask: true,
          agenda: true,
        },
        permissions: ['read', 'write'],
      });
      setNewDevice({ name: '', provider: 'apple-watch', model: '' });
      setShowAddDevice(false);
    }
  };

  const handleDeleteDevice = (deviceId: string) => {
    if (window.confirm('Are you sure you want to remove this device?')) {
      deleteWearableDevice(deviceId);
    }
  };

  const handleToggleSyncFeature = (deviceId: string, feature: keyof typeof wearableDevices[0]['syncFeatures']) => {
    const device = wearableDevices.find(d => d.id === deviceId);
    if (device) {
      updateWearableDevice(deviceId, {
        syncFeatures: {
          ...device.syncFeatures,
          [feature]: !device.syncFeatures[feature],
        },
      });
    }
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const renderDeviceCard = (device: typeof wearableDevices[0]) => (
    <Card key={device.id} className="p-6 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm">
      <div className="flex items-start space-x-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${getProviderColor(device.provider)}15` }}
        >
          <div style={{ color: getProviderColor(device.provider) }}>
            {getProviderIcon(device.provider)}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-medium text-[var(--app-text)]">{device.name}</h4>
              <p className="text-sm text-[var(--app-text-light)]">{device.model}</p>
            </div>
            <div className="flex items-center space-x-2">
              {device.isConnected ? (
                <Badge className="bg-[var(--app-green)]15 text-[var(--app-green)] border-0">
                  <Wifi size={12} className="mr-1" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="border-[var(--app-gray)] text-[var(--app-gray)]">
                  <WifiOff size={12} className="mr-1" />
                  Disconnected
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getBatteryIcon(device.batteryLevel)}</span>
              <span
                className="text-sm font-medium"
                style={{ color: getBatteryColor(device.batteryLevel) }}
              >
                {device.batteryLevel}%
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-[var(--app-text-light)]">
              <Clock size={14} />
              <span>Last sync: {formatLastSync(device.lastSync)}</span>
            </div>
          </div>

          {device.isConnected && (
            <>
              <div className="mb-4">
                <h5 className="text-sm font-medium text-[var(--app-text)] mb-3">Sync Features</h5>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Timer size={14} />
                      <span className="text-sm text-[var(--app-text)]">Pomodoro</span>
                    </div>
                    <Switch
                      checked={device.syncFeatures.pomodoro}
                      onCheckedChange={() => handleToggleSyncFeature(device.id, 'pomodoro')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Bell size={14} />
                      <span className="text-sm text-[var(--app-text)]">Notifications</span>
                    </div>
                    <Switch
                      checked={device.syncFeatures.notifications}
                      onCheckedChange={() => handleToggleSyncFeature(device.id, 'notifications')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Plus size={14} />
                      <span className="text-sm text-[var(--app-text)]">New Task</span>
                    </div>
                    <Switch
                      checked={device.syncFeatures.newTask}
                      onCheckedChange={() => handleToggleSyncFeature(device.id, 'newTask')}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} />
                      <span className="text-sm text-[var(--app-text)]">Agenda</span>
                    </div>
                    <Switch
                      checked={device.syncFeatures.agenda}
                      onCheckedChange={() => handleToggleSyncFeature(device.id, 'agenda')}
                    />
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSync(device.id)}
                  disabled={syncing === device.id}
                  className="flex-1"
                >
                  {syncing === device.id ? (
                    <RefreshCw size={14} className="mr-2 animate-spin" />
                  ) : (
                    <RefreshCw size={14} className="mr-2" />
                  )}
                  {syncing === device.id ? 'Syncing...' : 'Sync'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteDevice(device.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </>
          )}

          {!device.isConnected && (
            <Button
              onClick={() => handleConnect(device.id)}
              disabled={connecting === device.id}
              className="w-full"
              style={{ backgroundColor: getProviderColor(device.provider) }}
            >
              {connecting === device.id ? (
                <RefreshCw size={14} className="mr-2 animate-spin" />
              ) : (
                <Wifi size={14} className="mr-2" />
              )}
              {connecting === device.id ? 'Connecting...' : 'Connect'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Watch size={20} />
            <span>Wearable Devices</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-[var(--app-text)]">Connected Devices</h3>
              <p className="text-sm text-[var(--app-text-light)]">
                Manage your wearable devices and sync settings
              </p>
            </div>
            <Dialog open={showAddDevice} onOpenChange={setShowAddDevice}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-2" />
                  Add Device
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Wearable Device</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[var(--app-text)]">Device Name</label>
                    <input
                      type="text"
                      value={newDevice.name}
                      onChange={(e) => setNewDevice(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full mt-1 p-3 rounded-xl bg-[var(--app-light-gray)] border-0"
                      placeholder="My Apple Watch"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--app-text)]">Provider</label>
                    <select
                      value={newDevice.provider}
                      onChange={(e) => setNewDevice(prev => ({ ...prev, provider: e.target.value as any }))}
                      className="w-full mt-1 p-3 rounded-xl bg-[var(--app-light-gray)] border-0"
                    >
                      <option value="apple-watch">Apple Watch</option>
                      <option value="fitbit">Fitbit</option>
                      <option value="samsung">Samsung Galaxy Watch</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[var(--app-text)]">Model</label>
                    <input
                      type="text"
                      value={newDevice.model}
                      onChange={(e) => setNewDevice(prev => ({ ...prev, model: e.target.value }))}
                      className="w-full mt-1 p-3 rounded-xl bg-[var(--app-light-gray)] border-0"
                      placeholder="Series 8"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={() => setShowAddDevice(false)} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={handleAddDevice} className="flex-1">
                      Add Device
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {wearableDevices.length === 0 ? (
            <Card className="p-8 bg-[var(--app-card)] rounded-2xl border-0 shadow-sm text-center">
              <Watch size={48} className="mx-auto mb-4 text-[var(--app-gray)]" />
              <h3 className="text-lg font-medium text-[var(--app-text)] mb-2">No devices connected</h3>
              <p className="text-sm text-[var(--app-text-light)] mb-4">
                Add your wearable devices to sync Pomodoro sessions, notifications, and more.
              </p>
              <Button onClick={() => setShowAddDevice(true)}>
                <Plus size={16} className="mr-2" />
                Add Your First Device
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {wearableDevices.map(renderDeviceCard)}
            </div>
          )}

          <Card className="p-6 bg-gradient-to-r from-[var(--app-blue)] to-[var(--app-purple)] rounded-2xl border-0 shadow-lg text-white">
            <div className="flex items-center space-x-4">
              <Settings size={24} />
              <div>
                <h3 className="font-medium mb-1">Sync Tips</h3>
                <p className="text-sm text-white/80">
                  Keep your devices connected for the best experience. Enable sync features to get notifications and track your productivity.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WearableDevicesModal;
