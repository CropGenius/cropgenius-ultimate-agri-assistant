import MissionControl from '@/components/dashboard/MissionControl';

import Layout from '@/components/Layout';

const MissionControlPage = () => {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <MissionControl />
      </div>
    </Layout>
  );
};

export default MissionControlPage;
