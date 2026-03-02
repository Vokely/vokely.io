'use client';

import { useState, useEffect } from 'react';
import useToastStore from '@/store/toastStore';
import { motion, AnimatePresence } from 'framer-motion';
import useRoadmapStore from '@/store/roadmapStore';
import SlideInPanel from '@/components/roadmap/SlideInPanel';
import WelcomeCard from '@/components/roadmap/WelcomeSection';
import LearningPath from '@/components/roadmap/LearningPath';
import { calculateStats, generateRoadmapLinks, getRoadmapById, updateRoadmapStatus,updateRoadmapStreak ,getSkillStatus} from '@/lib/roadmapUtil';
import NotFound from '@/components/layouts/NotFound';
import SkillsList from '@/components/roadmap/SkillsList';
import useUserDetailsStore from '@/store/userDetails';
import { getProfileDetails } from '@/lib/fetchUtil';
import FiltersAndSearch from '@/components/roadmap/Filters';
import { getDateDifference } from '@/lib/dateUtil';
import NewSideBar from '@/components/layouts/NewSideBar';
import FeedbackComponent from '@/app/feedback/page';
import useNavigationStore from '@/store/navigationStore';
import { type } from 'os';

export default function SkillGapResults({params}) {
  const roadmap_id = params.id;
  const {roadmap, setRoadMap, setStreak, targetSkill, setTargetSkill, stats, setStats,endDate, setEndDate,filteredRoadmap,setFilteredRoadmap} = useRoadmapStore();
  const {getFeedback, setGetFeedback} = useNavigationStore();
  const addToast = useToastStore((state) => state.addToast);

  const [loading, setLoading] = useState(true);
  const [linksGenerating, setLinksGenerating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedHeading, setSelectedHeading] = useState(null);
  const [selectedSubHeading,setSelectedSubHeading] = useState(null)
  const [errorPage,showErrorPage] = useState(false);
  const [showFeedBack,setShowFeedBack] = useState(false);

  const {
    user_details: {
      personalInfo
    },setUserDetails,resetAllState,setHasUntrackedChanges
  } = useUserDetailsStore();
  const username = personalInfo.firstName + " " + personalInfo.lastName;

  const getStats = (roadmap) =>{
    const stats = calculateStats(roadmap);
    setStats(stats)
  }  

  const setRoadMapDetails = (response)=>{
    setRoadMap(response.roadmap)
    setFilteredRoadmap(response.roadmap);
    setStreak(response.streak)
    setTargetSkill(response.skill) 
    getStats(response.roadmap)    
    setEndDate(response.created_at);
    setGetFeedback(response?.feedback_received==false)
  }
  console.log(getFeedback)

  const updateHeadingDetails = (roadmap_response) => {
    if(roadmap_response==null) return;
    
    const topic = roadmap_response.find((h) => h.heading === selectedHeading);
  
    if (!topic) return null;
  
    const subHeading = topic.sub_headings.find(
      (sh) => sh.heading === selectedSubHeading
    );
    const areAllLinksEmpty = Object.values(subHeading.links).every(
      (linkArray) => Array.isArray(linkArray) && linkArray.length === 0
    );
    
    setSelectedTopic(subHeading);
    return areAllLinksEmpty;
  };
  
  const fetchLinks = async (heading) => {
    try {
      setLinksGenerating(true)
      const response = await generateRoadmapLinks(roadmap_id, heading);
      if(response.status!==200){
        addToast('An error occurred while generating roadmap', 'error', 'top-middle', 3000)
        return;
      }
      const responseJson = await response.json();
      setRoadMapDetails(responseJson);
      updateHeadingDetails(responseJson.roadmap)
    } catch (error) {
      console.error('Failed to fetch links:', error);
      addToast('An error occurred while fetching links', 'error', 'top-middle', 3000);
    }finally{
      setLinksGenerating(false);
    }
  };

  const handleStreakUpdate = async()=>{
    const response = await updateRoadmapStreak(roadmap_id);
    const responseJson = await response.json();
    setStreak(responseJson.streak);
  }

  const streakUpdateEligible = (last_logged_at) => {
    const dateDiff = getDateDifference(last_logged_at);
    
    if (dateDiff >= 1) {
      return true;
    }
    return false;
  };

  const fetchRoadmap = async () => {
    try {
      setLoading(true)
      const response = await getRoadmapById(roadmap_id );     
      if(!response.ok){
        showErrorPage(true)
        return;
      }
      const responseJson = await response.json();
      setRoadMapDetails(responseJson);
      if(streakUpdateEligible(responseJson.last_logged_at)){
        await handleStreakUpdate()
      }
      setLoading(false);
    } catch (error) {
      showErrorPage(true)
    }finally{
      setLoading(false)
    }
  };

  const fetchProfileDetails = async()=>{
    const response = await getProfileDetails();
    if(response?.profile_details != null) {
      setUserDetails(response?.profile_details?.resume_data);
    }else{
      resetAllState();
    }
    setHasUntrackedChanges(false)
  }

  const handleStatusChange = async(heading=selectedHeading,subHeading,newStatus,type)=>{
    const updatedRoadmap = await updateRoadmapStatus(roadmap_id, heading, subHeading, newStatus,type, );
    const responseJson = await updatedRoadmap.json();
    setRoadMap(responseJson.roadmap);
    setFilteredRoadmap(responseJson.roadmap);
    setRoadMapDetails(responseJson);
    updateHeadingDetails(responseJson.roadmap)
    getStats(responseJson.roadmap)
  }

  const handleSlideInClose = ()=>{
    if(!linksGenerating){
      setShowTopicModal(false);
    }
    setSelectedSubHeading(null);
    if(getFeedback){
      setShowFeedBack(true)
    }
  }

  useEffect(() => {  
      if(roadmap==null) fetchRoadmap();
      else setLoading(false)
      if(personalInfo.firstName==undefined) fetchProfileDetails();
  }, [roadmap_id]);


  useEffect(() => {
    if(selectedHeading && selectedSubHeading && updateHeadingDetails(roadmap)){
       fetchLinks(selectedHeading)
    }
  }, [selectedHeading]);

  useEffect(()=>{
    console.log(selectedTopic)
    if(selectedSubHeading){
      updateHeadingDetails(roadmap)
      setShowTopicModal(true)
    }
  },[selectedSubHeading])

  useEffect(()=>{
    const filter = statusFilter.toLowerCase().replace(' ', '_');
    if(roadmap!==null && roadmap!=undefined){
      if(filter === 'all_status'){
        setFilteredRoadmap(roadmap);
        return;
      }
      const filteredRoadmap = roadmap.filter(heading => getSkillStatus(heading) === filter);
      setFilteredRoadmap(filteredRoadmap);
    }
  },[statusFilter])

  if(errorPage){
    return (
      <NotFound/>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFCFF]">
      <div className='fixed left-0 top-0'><NewSideBar/></div>
      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-screen w-screen md:w-[100%]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <p className="mt-4 text-gray-600">Generating your personalized learning roadmap...</p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {showFeedBack && (
              <FeedbackComponent
              onClose={() => {setShowFeedBack(false);setGetFeedback(false)}}
              title="How much are you loving this feature so far?"
              description="Help us improve our AI. Share your thoughts on the topics, resources quality, and overall learning experience."
              moduleName="roadmap"
              moduleId={roadmap_id}
            />
            )}
            <WelcomeCard targetSkill={targetSkill} name={username} stats={stats} endDate={endDate}/>

            <LearningPath roadmap={roadmap}/>

            <FiltersAndSearch
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />

            <SkillsList
                roadmap={filteredRoadmap}
                setSelectedSubHeading={setSelectedSubHeading}
                setSelectedHeading={setSelectedHeading}
                fetchLinks={fetchLinks}
                linksGenerating={linksGenerating}
                selectedHeading={selectedHeading}
                handleStatusChange={handleStatusChange}
              />
          </div>
        )}
      </main>

      <AnimatePresence>
        {showTopicModal && selectedTopic && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-gray-500 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.75 }}
              exit={{ opacity: 0 }}
              onClick={handleSlideInClose}
            />

           <SlideInPanel 
           selectedTopic={selectedTopic} 
           onClose={handleSlideInClose} 
           isGenerating={linksGenerating} 
           selectedHeading={selectedHeading}
           handleStatusChange={handleStatusChange}
           />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}