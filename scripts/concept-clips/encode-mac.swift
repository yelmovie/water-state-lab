// Encodes raw RGBA frames from stdin to H.264 MP4 with macOS AVFoundation (no ffmpeg needed).
// Usage: encode-mac <width> <height> <fps> <out.mp4>
import AVFoundation
import Foundation
let a=CommandLine.arguments
guard a.count==5,let w=Int(a[1]),let h=Int(a[2]),let fps=Int32(a[3]) else{fatalError("usage")}
let url=URL(fileURLWithPath:a[4])
try? FileManager.default.removeItem(at:url)
let writer=try AVAssetWriter(outputURL:url,fileType:.mp4)
let input=AVAssetWriterInput(mediaType:.video,outputSettings:[AVVideoCodecKey:AVVideoCodecType.h264,AVVideoWidthKey:w,AVVideoHeightKey:h,AVVideoCompressionPropertiesKey:[AVVideoAverageBitRateKey:900_000,AVVideoProfileLevelKey:AVVideoProfileLevelH264MainAutoLevel]])
let adaptor=AVAssetWriterInputPixelBufferAdaptor(assetWriterInput:input,sourcePixelBufferAttributes:[kCVPixelBufferPixelFormatTypeKey as String:kCVPixelFormatType_32BGRA,kCVPixelBufferWidthKey as String:w,kCVPixelBufferHeightKey as String:h])
writer.add(input);writer.shouldOptimizeForNetworkUse=true
guard writer.startWriting() else{fatalError("start failed")}
writer.startSession(atSourceTime:.zero)
let size=w*h*4,stdin=FileHandle.standardInput
var frame:Int64=0
while true{
 let done:Bool=autoreleasepool{
  var data=Data()
  while data.count<size{guard let part=try? stdin.read(upToCount:size-data.count),!part.isEmpty else{break};data.append(part)}
  if data.count<size{return true}
  while !input.isReadyForMoreMediaData{Thread.sleep(forTimeInterval:0.002)}
  var buffer:CVPixelBuffer?
  CVPixelBufferPoolCreatePixelBuffer(nil,adaptor.pixelBufferPool!,&buffer)
  let px=buffer!
  CVPixelBufferLockBaseAddress(px,[])
  let base=CVPixelBufferGetBaseAddress(px)!.assumingMemoryBound(to:UInt8.self),row=CVPixelBufferGetBytesPerRow(px)
  data.withUnsafeBytes{(src:UnsafeRawBufferPointer) in
   for y in 0..<h{for x in 0..<w{let s=(y*w+x)*4,d=y*row+x*4
    base[d]=src[s+2];base[d+1]=src[s+1];base[d+2]=src[s];base[d+3]=255}}
  }
  CVPixelBufferUnlockBaseAddress(px,[])
  adaptor.append(px,withPresentationTime:CMTime(value:frame,timescale:fps))
  frame+=1
  return false
 }
 if done{break}
}
input.markAsFinished()
let wait=DispatchSemaphore(value:0)
writer.finishWriting{wait.signal()}
wait.wait()
guard writer.status == .completed else{fatalError("write failed: \(String(describing:writer.error))")}
print("frames",frame)
