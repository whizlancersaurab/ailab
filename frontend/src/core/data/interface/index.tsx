export interface OptionType  {
    label: string;
    value: string;
};

export interface syllabusData  {
    id:number;
    className:string;
    month_no:number;
    title:string;
    activity:string;
    description:string;
    status:string;
    updated_at:string;

} 

export interface TasksData {
    id:number;
    className:string;
    month_no:number;
    title:string;
    taskTitle:string;
    status:string;
    created_at:string;
}