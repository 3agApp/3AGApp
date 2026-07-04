import { Head } from '@inertiajs/react';
import { Download, ExternalLink, Github, Loader2, Package, Plug, Smartphone } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslations } from '@/hooks/use-translations';

type DownloadItem = {
    owner: string;
    repo: string;
    name: string;
    type: 'app' | 'plugin';
    description: string;
};

type GitHubReleaseAsset = {
    id: number;
    name: string;
    browser_download_url: string;
    size: number;
};

type GitHubRelease = {
    html_url: string;
    tag_name: string;
    name: string | null;
    published_at: string | null;
    assets: GitHubReleaseAsset[];
};

type ReleaseState = { status: 'loading' } | { status: 'ready'; release: GitHubRelease } | { status: 'error'; message: string };

const downloads: DownloadItem[] = [
    {
        owner: '3agApp',
        repo: 'QuickSale',
        name: 'QuickSale',
        type: 'app',
        description: 'Android sales and checkout companion for retail workflows.',
    },
    {
        owner: '3agApp',
        repo: 'woo-kontor-sync',
        name: 'Woo Kontor Sync',
        type: 'plugin',
        description: 'WooCommerce integration for Kontor product and stock synchronization.',
    },
    {
        owner: '3agApp',
        repo: 'woo-b2b',
        name: 'Woo B2B',
        type: 'plugin',
        description: 'B2B tools for WooCommerce stores that serve business customers.',
    },
    {
        owner: '3agApp',
        repo: 'woo-nalda-sync',
        name: 'Woo Nalda Sync',
        type: 'plugin',
        description: 'Nalda catalog and inventory synchronization for WooCommerce.',
    },
    {
        owner: '3agApp',
        repo: 'woo-stock-sync-from-csv',
        name: 'Woo Stock Sync from CSV',
        type: 'plugin',
        description: 'CSV-based stock synchronization for WooCommerce product inventories.',
    },
];

function formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) {
        return '';
    }

    const units = ['B', 'KB', 'MB', 'GB'];
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / 1024 ** exponent;

    return `${value >= 10 || exponent === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[exponent]}`;
}

function formatDate(value: string | null): string {
    if (!value) {
        return 'Latest release';
    }

    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(value));
}

function releaseUrl(item: DownloadItem): string {
    return `https://github.com/${item.owner}/${item.repo}/releases/latest`;
}

function repositoryUrl(item: DownloadItem): string {
    return `https://github.com/${item.owner}/${item.repo}`;
}

export default function Downloads() {
    const { t } = useTranslations();
    const [releases, setReleases] = useState<Record<string, ReleaseState>>(() =>
        Object.fromEntries(downloads.map((item) => [item.repo, { status: 'loading' as const }])),
    );

    const appCount = useMemo(() => downloads.filter((item) => item.type === 'app').length, []);
    const pluginCount = downloads.length - appCount;

    useEffect(() => {
        const abortController = new AbortController();

        async function loadReleases() {
            const results = await Promise.all(
                downloads.map(async (item) => {
                    try {
                        const response = await fetch(`https://api.github.com/repos/${item.owner}/${item.repo}/releases/latest`, {
                            headers: { Accept: 'application/vnd.github+json' },
                            signal: abortController.signal,
                        });

                        if (!response.ok) {
                            throw new Error(`GitHub returned ${response.status}`);
                        }

                        const release = (await response.json()) as GitHubRelease;

                        return [item.repo, { status: 'ready', release } satisfies ReleaseState] as const;
                    } catch (error) {
                        if (abortController.signal.aborted) {
                            return [item.repo, { status: 'loading' } satisfies ReleaseState] as const;
                        }

                        const message = error instanceof Error ? error.message : 'Unable to load the latest release.';

                        return [item.repo, { status: 'error', message } satisfies ReleaseState] as const;
                    }
                }),
            );

            if (!abortController.signal.aborted) {
                setReleases(Object.fromEntries(results));
            }
        }

        void loadReleases();

        return () => {
            abortController.abort();
        };
    }, []);

    return (
        <>
            <Head title={t('downloads.title', 'Downloads')} />

            <div className="container mx-auto px-4 py-12">
                <div className="mx-auto mb-10 max-w-3xl text-center">
                    <div className="mb-4 inline-flex items-center rounded-full border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
                        <Github className="mr-2 h-4 w-4" />
                        {t('downloads.badge', 'Latest GitHub releases')}
                    </div>
                    <h1 className="mb-4 text-4xl font-bold tracking-tight">{t('downloads.heading', 'Downloads')}</h1>
                    <p className="text-lg text-muted-foreground">
                        {t('downloads.subheading', 'Download the newest 3AG apps and WooCommerce plugins directly from our GitHub release assets.')}
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <Badge variant="secondary">
                            {appCount} {t('downloads.apps', 'app')}
                        </Badge>
                        <Badge variant="secondary">
                            {pluginCount} {t('downloads.plugins', 'plugins')}
                        </Badge>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {downloads.map((item) => {
                        const state = releases[item.repo] ?? { status: 'loading' };
                        const Icon = item.type === 'app' ? Smartphone : Plug;

                        return (
                            <Card key={item.repo} className="overflow-hidden">
                                <CardHeader className="gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="mb-2 flex flex-wrap items-center gap-2">
                                                <CardTitle className="text-xl">{item.name}</CardTitle>
                                                <Badge variant={item.type === 'app' ? 'secondary' : 'default'}>
                                                    {item.type === 'app' ? t('downloads.app', 'App') : t('downloads.plugin', 'Plugin')}
                                                </Badge>
                                            </div>
                                            <CardDescription>{item.description}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    <div className="rounded-lg border bg-muted/30 p-4">
                                        {state.status === 'loading' && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                {t('downloads.loadingRelease', 'Checking latest release...')}
                                            </div>
                                        )}

                                        {state.status === 'ready' && (
                                            <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                                                <div className="font-medium">
                                                    {state.release.name || state.release.tag_name}
                                                    <span className="ml-2 text-muted-foreground">{state.release.tag_name}</span>
                                                </div>
                                                <div className="text-muted-foreground">{formatDate(state.release.published_at)}</div>
                                            </div>
                                        )}

                                        {state.status === 'error' && (
                                            <div className="text-sm text-muted-foreground">
                                                {t('downloads.releaseUnavailable', 'Latest release details are unavailable right now.')}
                                                <span className="sr-only">{state.message}</span>
                                            </div>
                                        )}
                                    </div>

                                    {state.status === 'ready' && state.release.assets.length > 0 && (
                                        <div className="space-y-2">
                                            {state.release.assets.map((asset) => (
                                                <Button key={asset.id} asChild className="w-full justify-between">
                                                    <a href={asset.browser_download_url}>
                                                        <span className="flex min-w-0 items-center gap-2">
                                                            <Download className="h-4 w-4" />
                                                            <span className="truncate">{asset.name}</span>
                                                        </span>
                                                        {formatBytes(asset.size) && (
                                                            <span className="ml-3 shrink-0 text-xs opacity-80">{formatBytes(asset.size)}</span>
                                                        )}
                                                    </a>
                                                </Button>
                                            ))}
                                        </div>
                                    )}

                                    {state.status === 'ready' && state.release.assets.length === 0 && (
                                        <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                                            <Package className="h-4 w-4 shrink-0" />
                                            {t('downloads.noAssets', 'This release has no uploaded files. Open GitHub to download source archives.')}
                                        </div>
                                    )}
                                </CardContent>

                                <CardFooter className="flex flex-col gap-3 sm:flex-row">
                                    <Button variant="outline" asChild className="w-full">
                                        <a
                                            href={state.status === 'ready' ? state.release.html_url : releaseUrl(item)}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            {t('downloads.openRelease', 'Open release')}
                                        </a>
                                    </Button>
                                    <Button variant="ghost" asChild className="w-full">
                                        <a href={repositoryUrl(item)} target="_blank" rel="noreferrer">
                                            <Github className="h-4 w-4" />
                                            {t('downloads.viewRepository', 'Repository')}
                                        </a>
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </>
    );
}
