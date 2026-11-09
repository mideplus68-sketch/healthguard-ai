import AsyncStorage from '@react-native-async-storage/async-storage';
import { isValidIsoDate } from './healthData';
import { supabase } from './supabase';

const toSqlDate=value=>{if(isValidIsoDate(String(value)))return String(value);const parsed=new Date(value);if(Number.isNaN(parsed.getTime()))throw new Error('A record has an invalid date and was not synced.');return parsed.toISOString().slice(0,10)};
const fromSqlDate=value=>new Date(value+'T12:00:00').toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'});
export const photoBucket='healthguard-profile-photos';
export const localPhotoKey=(userId,profileId)=>`healthguard-photo-${userId}-${profileId}`;
function base64Bytes(encoded){const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';const padding=encoded.endsWith('==')?2:encoded.endsWith('=')?1:0;const bytes=new Uint8Array(Math.floor(encoded.length*3/4)-padding);let buffer=0,bits=0,offset=0;for(const char of encoded){if(char==='=')break;const value=alphabet.indexOf(char);if(value<0)continue;buffer=(buffer<<6)|value;bits+=6;if(bits>=8){bits-=8;bytes[offset++]=(buffer>>bits)&255}}return bytes}
export async function loadCloudData(userId){
 const [profiles,measurements,checkins,labs]=await Promise.all([
  supabase.from('profiles').select('id,name,age,kind,avatar,avatar_path').order('created_at'),
  supabase.from('measurements').select('id,profile_id,recorded_on,temperature_c,note').order('recorded_on',{ascending:false}),
  supabase.from('symptom_checkins').select('id,profile_id,recorded_on,symptoms,red_flags').order('recorded_on',{ascending:false}),
  supabase.from('lab_results').select('id,profile_id,tested_on,test_type,result,laboratory_name').order('tested_on',{ascending:false}),
 ]);
 for(const response of [profiles,measurements,checkins,labs])if(response.error)throw response.error;
 return {
  profiles:await Promise.all(profiles.data.map(async x=>{let avatarImage=null;if(x.avatar_path){const {data,error}=await supabase.storage.from(photoBucket).createSignedUrl(x.avatar_path,3600);if(!error)avatarImage=data.signedUrl}if(!avatarImage&&x.avatar==='photo')avatarImage=await AsyncStorage.getItem(localPhotoKey(userId,x.id));return {...x,age:Number(x.age),avatar:x.avatar||'3d-0',avatarPath:x.avatar_path||null,avatarImage}})),
  logs:measurements.data.map(x=>({id:x.id,profile:x.profile_id,date:fromSqlDate(x.recorded_on),dateISO:x.recorded_on,temperature:x.temperature_c==null?null:Number(x.temperature_c),note:x.note})),
  assessments:checkins.data.map(x=>({id:x.id,profile:x.profile_id,date:fromSqlDate(x.recorded_on),dateISO:x.recorded_on,symptoms:x.symptoms||[],redFlags:x.red_flags||[]})),
  labs:labs.data.map(x=>({id:x.id,profile:x.profile_id,date:fromSqlDate(x.tested_on),dateISO:x.tested_on,type:x.test_type,result:x.result,lab:x.laboratory_name})),
 };
}
export async function persistCloudData(userId,data){
 const profiles=data.profiles.map(x=>({id:x.id,owner_id:userId,name:x.name,age:x.age,kind:x.kind,avatar:x.avatar||'3d-0',avatar_path:x.avatarPath||null}));
 if(profiles.length){const {error}=await supabase.from('profiles').upsert(profiles,{onConflict:'id'});if(error)throw error}
 const measurements=data.logs.map(x=>({id:x.id,profile_id:x.profile,owner_id:userId,recorded_on:toSqlDate(x.dateISO||x.date),temperature_c:x.temperature,note:x.note||''}));
 const checkins=data.assessments.map(x=>({id:x.id,profile_id:x.profile,owner_id:userId,recorded_on:toSqlDate(x.dateISO||x.date),symptoms:x.symptoms||[],red_flags:x.redFlags||[]}));
 const labs=data.labs.map(x=>({id:x.id,profile_id:x.profile,owner_id:userId,tested_on:toSqlDate(x.dateISO||x.date),test_type:x.type,result:x.result,laboratory_name:x.lab||'Laboratory not specified'}));
 for(const [table,rows] of [['measurements',measurements],['symptom_checkins',checkins],['lab_results',labs]])if(rows.length){const {error}=await supabase.from(table).upsert(rows,{onConflict:'id'});if(error)throw error}
}
export async function uploadProfilePhoto(userId,profileId,asset){
 const mimeType=asset.mimeType||'image/jpeg';
 if(!['image/jpeg','image/png','image/webp'].includes(mimeType))throw new Error('Choose a JPEG, PNG, or WebP image.');
 if((asset.fileSize&&asset.fileSize>2*1024*1024)||(asset.base64&&asset.base64.length>2.8*1024*1024))throw new Error('Choose a profile photo smaller than 2 MB.');
 if(!asset.base64)throw new Error('Could not read the selected photo. Please choose another image.');
 const extension=mimeType==='image/png'?'png':mimeType==='image/webp'?'webp':'jpg';
 const path=`${userId}/${profileId}/avatar.${extension}`;
 const bytes=base64Bytes(asset.base64);
 const {error}=await supabase.storage.from(photoBucket).upload(path,bytes.buffer,{contentType:mimeType,upsert:true,cacheControl:'3600'});
 if(error)throw error;
 const {data:signed,error:signedError}=await supabase.storage.from(photoBucket).createSignedUrl(path,3600);
 if(signedError)throw signedError;
 return {avatar:'photo',avatarPath:path,avatarImage:signed.signedUrl};
}
