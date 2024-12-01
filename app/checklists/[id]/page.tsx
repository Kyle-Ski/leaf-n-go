"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/checkbox';
import { ChecklistWithItems } from '@/types/projectTypes';
import { withAuth } from '@/lib/withAuth';
import { useAuth } from '@/lib/auth-Context';
import { useParams } from 'next/navigation';

const ChecklistDetailsPage = () => {
  const params = useParams();
  const { user } = useAuth();
  const id = params?.id;

  const [checklist, setChecklist] = useState<ChecklistWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemError, setItemError] = useState<string | null>(null); // Track errors for specific items

  useEffect(() => {
    if (user && id) {
      fetchChecklistDetails(id as string);
    }
  }, [user, id]);

  const fetchChecklistDetails = async (checklistId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/checklists/${checklistId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch checklist details');
        return;
      }

      const checklistData: ChecklistWithItems = await response.json();
      setChecklist(checklistData);
    } catch (err) {
      console.error('Error fetching checklist details:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleItemToggle = async (itemId: string, completed: boolean) => {
    try {
      setItemError(null); // Clear previous item errors
      const response = await fetch(`/api/checklists/${id}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '',
        },
        body: JSON.stringify({ checklistId: id, itemId, completed }),
      });

      if (!response.ok) {
        throw new Error('Failed to update item status');
      }

      // Update the checklist state optimistically
      setChecklist((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          items: prev.items.map((item) =>
            item.id === itemId ? { ...item, completed } : item
          ),
        };
      });
    } catch (err) {
      console.error('Error updating item status:', err);
      setItemError(`Failed to update the status for item ID: ${itemId}`);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!checklist) {
    return <p>No checklist found.</p>;
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-4 space-y-8 sm:p-6">
      <section className="w-full max-w-4xl space-y-8">
        <Card className="p-6 bg-white shadow-lg">
          <CardHeader>
            <CardTitle>{checklist.title}</CardTitle>
            <p className="text-sm text-gray-500">Category: {checklist.category}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {checklist.items && checklist.items.length > 0 ? (
              checklist.items.map((item) => (
                <div key={item.id} className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      checked={item.completed}
                      onCheckedChange={(value) =>
                        handleItemToggle(item.id, value as boolean)
                      }
                    />
                    <div>
                      <span
                        className={`block ${
                          item.completed ? 'line-through text-gray-500' : ''
                        }`}
                      >
                        {item.items.name}
                      </span>
                      <span className="text-sm text-gray-500">{item.items.notes}</span>
                    </div>
                  </div>
                  {itemError && itemError.includes(item.id) && (
                    <p className="text-sm text-red-500">{itemError}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500">No items added to this checklist.</p>
            )}
          </CardContent>
        </Card>
        <div className="flex justify-center">
          <Link href="/checklists">
            <Button variant="default" className="bg-blue-500 text-white hover:bg-blue-600">
              Back to Checklists
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default withAuth(ChecklistDetailsPage);
