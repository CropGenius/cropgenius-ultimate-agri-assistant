import MissionControl from '@/components/dashboard/MissionControl';
import { useTasks } from '@/features/mission-control/hooks/useTasks';
import Layout from '@/components/Layout';

const MissionControlPage = () => {
  const { data: tasks = [], isLoading } = useTasks();

  // adapt Task to Action expected by MissionControl component
  const actions = tasks.map(t => ({
    id: t.id,
    title: t.title,
    description: t.description ?? '',
    type: t.type,
    urgent: t.urgent,
  }));

  return (
    <Layout>
      <div className="max-w-xl mx-auto pt-16 px-4">
        <MissionControl actions={actions} loading={isLoading} />
      </div>
    </Layout>
  );
};

export default MissionControlPage;
