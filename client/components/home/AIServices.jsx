import { sectionsData } from '@/data/home';
import ServiceItem from './ServiceItem';

export default function AIServices() {
  return (
    <div className="bg-gray-50">
      {sectionsData.map((service, index) => (
        <ServiceItem 
          key={service.id || index} 
          sectionData={service} 
        />
      ))}
    </div>
  );
}