
'use client';

import { useUser, useAuth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getAllAssessments, type AnalysisResult } from '@/app/lib/data-store';
import { format } from 'date-fns';

export default function AdminDashboardPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [assessments, setAssessments] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isUserLoading) {
      // Still waiting for auth state to be determined, do nothing yet.
      return;
    }
    if (!user) {
      // If auth state is resolved and there's no user, redirect.
      router.push('/admin/login');
      return;
    }

    const fetchAssessments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const idTokenResult = await user.getIdTokenResult(true); // Force refresh
        if (idTokenResult.claims.isAdmin) {
          const data = await getAllAssessments();
          setAssessments(data);
        } else {
          setError(
            'Access Denied: You do not have administrative privileges. Please contact your system administrator.'
          );
        }
      } catch (e: any) {
        console.error('Error fetching assessments:', e);
        // Use the detailed error message from FirestorePermissionError if available
        setError(e.message || 'Failed to fetch assessment data. You may not have the required permissions.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssessments();
  }, [user, isUserLoading, router]);


  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const handleSignOut = async () => {
    if (auth) {
      await auth.signOut();
      router.push('/admin/login');
    }
  };

  const getCategoryVariant = (category: string) => {
    if (category.includes('QUICK WIN')) return 'default';
    if (category.includes('STRATEGIC')) return 'secondary';
    if (category.includes('INCREMENTAL')) return 'outline';
    return 'destructive';
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-start pt-8 sm:pt-12 pb-16 px-4">
      <header className="w-full max-w-6xl flex items-center justify-between mb-10">
        <h1 className="font-headline text-3xl md:text-4xl font-semibold text-foreground">
          Admin Dashboard
        </h1>
        <Button onClick={handleSignOut}>Sign Out</Button>
      </header>
      <main className="w-full max-w-6xl">
        {isLoading ? (
          <div className="flex w-full items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20 border rounded-lg bg-card text-destructive p-4">
            <p className="font-semibold text-lg">Access Denied</p>
            <p className="text-muted-foreground mt-2 font-mono text-sm whitespace-pre-wrap">
              {error}
            </p>
             <Button variant="outline" className="mt-6" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Process Name</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Total Score</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      No assessments submitted yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  assessments.map(assessment => (
                    <TableRow key={assessment.id}>
                      <TableCell className="font-medium">{assessment.formData.processName}</TableCell>
                      <TableCell>
                        {assessment.submittedAt ? format(new Date(assessment.submittedAt), 'MMM d, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell>{assessment.scores.totalScore}</TableCell>
                      <TableCell>
                        <Badge variant={getCategoryVariant(assessment.scores.category)}>
                          {assessment.scores.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/analysis/${assessment.id}`)}
                        >
                          View Report
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </div>
  );
}
