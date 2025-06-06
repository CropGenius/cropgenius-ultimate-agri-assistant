import React, { useState } from 'react';
import { useFarm } from '../hooks/useFarm';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function FarmManagementTest() {
  const {
    farms,
    selectedFarm,
    isLoading,
    error,
    setSelectedFarm,
    refreshFarms,
    addFarm,
    updateFarm,
    deleteFarm,
  } = useFarm();

  const [newFarm, setNewFarm] = useState({
    name: '',
    location: '',
    size: '',
    size_unit: 'acres',
  });
  const [editingFarm, setEditingFarm] = useState<{
    id: string;
    name: string;
    location: string;
    size: string;
    size_unit: string;
  } | null>(null);

  const handleAddFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addFarm({
        name: newFarm.name,
        location: newFarm.location,
        size: parseFloat(newFarm.size),
        size_unit: newFarm.size_unit,
      });
      setNewFarm({ name: '', location: '', size: '', size_unit: 'acres' });
      await refreshFarms();
    } catch (err) {
      console.error('Failed to add farm:', err);
    }
  };

  const handleUpdateFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFarm) return;

    try {
      await updateFarm(editingFarm.id, {
        name: editingFarm.name,
        location: editingFarm.location,
        size: parseFloat(editingFarm.size),
        size_unit: editingFarm.size_unit,
      });
      setEditingFarm(null);
      await refreshFarms();
    } catch (err) {
      console.error('Failed to update farm:', err);
    }
  };

  const handleDeleteFarm = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this farm?')) {
      try {
        await deleteFarm(id);
        await refreshFarms();
      } catch (err) {
        console.error('Failed to delete farm:', err);
      }
    }
  };

  if (isLoading && farms.length === 0) {
    return <div>Loading farms...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Add New Farm</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddFarm} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Farm Name
                </label>
                <Input
                  type="text"
                  value={newFarm.name}
                  onChange={(e) =>
                    setNewFarm({ ...newFarm, name: e.target.value })
                  }
                  placeholder="Enter farm name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Location
                </label>
                <Input
                  type="text"
                  value={newFarm.location}
                  onChange={(e) =>
                    setNewFarm({ ...newFarm, location: e.target.value })
                  }
                  placeholder="Enter location"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Size</label>
                <div className="flex">
                  <Input
                    type="number"
                    step="0.01"
                    value={newFarm.size}
                    onChange={(e) =>
                      setNewFarm({ ...newFarm, size: e.target.value })
                    }
                    placeholder="Enter size"
                    required
                    className="rounded-r-none"
                  />
                  <select
                    value={newFarm.size_unit}
                    onChange={(e) =>
                      setNewFarm({ ...newFarm, size_unit: e.target.value })
                    }
                    className="border border-l-0 rounded-r-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="acres">Acres</option>
                    <option value="hectares">Hectares</option>
                  </select>
                </div>
              </div>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Farm'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {editingFarm && (
        <Card className="bg-yellow-50">
          <CardHeader>
            <CardTitle>Edit Farm</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateFarm} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Farm Name
                  </label>
                  <Input
                    type="text"
                    value={editingFarm.name}
                    onChange={(e) =>
                      setEditingFarm({ ...editingFarm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Location
                  </label>
                  <Input
                    type="text"
                    value={editingFarm.location}
                    onChange={(e) =>
                      setEditingFarm({
                        ...editingFarm,
                        location: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Size</label>
                  <div className="flex">
                    <Input
                      type="number"
                      step="0.01"
                      value={editingFarm.size}
                      onChange={(e) =>
                        setEditingFarm({ ...editingFarm, size: e.target.value })
                      }
                      required
                      className="rounded-r-none"
                    />
                    <select
                      value={editingFarm.size_unit}
                      onChange={(e) =>
                        setEditingFarm({
                          ...editingFarm,
                          size_unit: e.target.value,
                        })
                      }
                      className="border border-l-0 rounded-r-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="acres">Acres</option>
                      <option value="hectares">Hectares</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="space-x-2">
                <Button type="submit" variant="outline" disabled={isLoading}>
                  {isLoading ? 'Updating...' : 'Update'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingFarm(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>My Farms</CardTitle>
        </CardHeader>
        <CardContent>
          {farms.length === 0 ? (
            <p className="text-gray-500">
              No farms found. Add your first farm above.
            </p>
          ) : (
            <div className="space-y-4">
              {farms.map((farm) => (
                <div
                  key={farm.id}
                  className={`p-4 border rounded-lg ${
                    selectedFarm?.id === farm.id
                      ? 'border-primary bg-primary/5'
                      : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{farm.name}</h3>
                      <p className="text-sm text-gray-600">
                        {farm.location} • {farm.size} {farm.size_unit}
                      </p>
                    </div>
                    <div className="space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setEditingFarm({
                            id: farm.id,
                            name: farm.name,
                            location: farm.location,
                            size: farm.size.toString(),
                            size_unit: farm.size_unit,
                          })
                        }
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteFarm(farm.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default FarmManagementTest;
