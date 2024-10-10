// custom-versions-datasource.ts
import { DataSource } from 'renovate/dist/datasource/types';
import versions from './l2/versions';

export const customVersionsDatasource: DataSource = {
  id: 'custom-versions',
  defaultRegistryUrls: [],
  registryStrategy: 'first',

  async getReleases({ packageName }: { packageName: string }) {
    const entry = Object.values(versions).find(v => v.depName === packageName);
    if (!entry) {
      return null;
    }

    return {
      releases: [{ version: entry.version }],
      sourceUrl: entry.repoUrl,
      lookupName: entry.lookupName,
    };
  },
};