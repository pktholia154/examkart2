'use client';

import React from 'react';
import { PurchasedView } from './PurchasedView';
import { ExamItem, BookItem, BundleItem, UserEntitlement, UserSubscription } from '@/lib/types';

interface LibraryViewProps {
  entitlements: UserEntitlement[];
  userSubscription?: UserSubscription | null;
  allExams: ExamItem[];
  allBooks: BookItem[];
  allBundles?: BundleItem[];
  onOpenExam: (exam: ExamItem, entitlement?: UserEntitlement) => void;
  onOpenBook: (book: BookItem, entitlement?: UserEntitlement) => void;
  onOpenBundle?: (bundle: BundleItem) => void;
  onRenewValidity?: (item: ExamItem | BookItem | BundleItem, itemType: 'exam' | 'book' | 'bundle', expiredDateStr?: string) => void;
  onGetSubscription?: () => void;
  onExploreMore: () => void;
}

export function LibraryView(props: LibraryViewProps) {
  return (
    <PurchasedView
      entitlements={props.entitlements}
      userSubscription={props.userSubscription}
      allExams={props.allExams}
      allBooks={props.allBooks}
      allBundles={props.allBundles || []}
      onOpenExam={props.onOpenExam}
      onOpenBook={props.onOpenBook}
      onOpenBundle={props.onOpenBundle}
      onRenewValidity={props.onRenewValidity || (() => {})}
      onGetSubscription={props.onGetSubscription || (() => {})}
      onExploreMore={props.onExploreMore}
    />
  );
}
