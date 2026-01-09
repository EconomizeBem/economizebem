export const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
    const renderCardSkeleton = () => (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 skeleton" />
            <div className="p-4 space-y-3">
                <div className="h-5 bg-zinc-100 dark:bg-zinc-800 rounded skeleton" />
                <div className="h-5 w-2/3 bg-zinc-100 dark:bg-zinc-800 rounded skeleton" />
                <div className="h-8 w-1/2 bg-zinc-100 dark:bg-zinc-800 rounded skeleton" />
                <div className="flex gap-2">
                    <div className="h-10 flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-full skeleton" />
                    <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-full skeleton" />
                </div>
            </div>
        </div>
    );

    const renderPlanSkeleton = () => (
        <div className="rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 p-6 space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl skeleton" />
                <div className="space-y-2 flex-1">
                    <div className="h-4 w-24 bg-zinc-100 dark:bg-zinc-800 rounded skeleton" />
                    <div className="h-3 w-32 bg-zinc-100 dark:bg-zinc-800 rounded skeleton" />
                </div>
            </div>
            <div className="py-6 space-y-2">
                <div className="h-10 w-32 mx-auto bg-zinc-100 dark:bg-zinc-800 rounded skeleton" />
                <div className="h-8 w-40 mx-auto bg-zinc-100 dark:bg-zinc-800 rounded skeleton" />
            </div>
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded skeleton" />
                ))}
            </div>
            <div className="h-10 bg-zinc-100 dark:bg-zinc-800 rounded-full skeleton" />
        </div>
    );

    const renderListSkeleton = () => (
        <div className="flex items-center gap-4 p-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded skeleton" />
            <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded skeleton" />
                <div className="h-3 w-1/2 bg-zinc-100 dark:bg-zinc-800 rounded skeleton" />
            </div>
            <div className="h-6 w-20 bg-zinc-100 dark:bg-zinc-800 rounded skeleton" />
        </div>
    );

    const skeletons = {
        card: renderCardSkeleton,
        plan: renderPlanSkeleton,
        list: renderListSkeleton
    };

    const renderFn = skeletons[type] || skeletons.card;

    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i}>{renderFn()}</div>
            ))}
        </>
    );
};
