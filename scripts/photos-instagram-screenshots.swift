// Find screenshots of Instagram posts in Apple Photos and put them in an album
// called "TO DELETE? Instagram screenshots". It never deletes anything.
//
//   swift scripts/photos-instagram-screenshots.swift --dry    (just count + write the list)
//   swift scripts/photos-instagram-screenshots.swift          (also adds them to the album)
//
// macOS asks once to let Terminal use Photos. Everything runs on this Mac:
// Apple's own text recognition (Vision) reads each screenshot; nothing is uploaded
// and no AI service is called. Writes photos-instagram-screenshots.csv in the repo
// root (gitignored) so Claude can check the matches.
//
// A screenshot counts as Instagram when its text says "Instagram", or has two or
// more of Instagram's own labels ("Liked by", "View all … comments", "Add a comment", …).
// If scripts/ig-saved-accounts.txt exists (the accounts of your saved posts), the
// list also notes when one of those account names appears in the screenshot.

import Foundation
import Photos
import Vision
import AppKit

let dry = CommandLine.arguments.contains("--dry")
let albumName = "TO DELETE? Instagram screenshots"
let scriptDir = URL(fileURLWithPath: #filePath).deletingLastPathComponent()
let repoRoot = scriptDir.deletingLastPathComponent()

// ---- permission
let sem = DispatchSemaphore(value: 0)
var status = PHAuthorizationStatus.notDetermined
PHPhotoLibrary.requestAuthorization(for: .readWrite) { s in status = s; sem.signal() }
sem.wait()
guard status == .authorized else {
    print("Photos access wasn't granted. Open System Settings > Privacy & Security > Photos, allow Terminal (Full Access), then run this again.")
    exit(1)
}

// ---- accounts of saved posts (optional)
var saved = Set<String>()
if let t = try? String(contentsOf: scriptDir.appendingPathComponent("ig-saved-accounts.txt"), encoding: .utf8) {
    for line in t.split(separator: "\n") {
        let a = line.trimmingCharacters(in: .whitespaces).lowercased()
        if a.count >= 6 { saved.insert(a) }
    }
}

// ---- every screenshot in the library, oldest first
let fo = PHFetchOptions()
fo.predicate = NSPredicate(format: "(mediaSubtypes & %d) != 0", PHAssetMediaSubtype.photoScreenshot.rawValue)
fo.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: true)]
let assets = PHAsset.fetchAssets(with: .image, options: fo)
print("\(assets.count) screenshots in Photos; reading their text (this can take a while)…")

let markers = ["liked by", "view all", "add a comment", "comments", "followers", "following",
               "see translation", "suggested for you", "original audio", "send message", "reels", "view insights"]
let ro = PHImageRequestOptions()
ro.isSynchronous = true
ro.deliveryMode = .highQualityFormat
ro.resizeMode = .fast
ro.isNetworkAccessAllowed = true   // screenshots stored only in iCloud are fetched to be read

func textOf(_ asset: PHAsset) -> String {
    var cg: CGImage?
    PHImageManager.default().requestImage(for: asset, targetSize: CGSize(width: 1400, height: 1400),
                                          contentMode: .aspectFit, options: ro) { img, _ in
        cg = img?.cgImage(forProposedRect: nil, context: nil, hints: nil)
    }
    guard let image = cg else { return "" }
    let req = VNRecognizeTextRequest()
    req.recognitionLevel = .accurate
    req.usesLanguageCorrection = false
    try? VNImageRequestHandler(cgImage: image, options: [:]).perform([req])
    let lines = (req.results ?? []).compactMap { $0.topCandidates(1).first?.string }
    return lines.joined(separator: " ")
}

let df = DateFormatter(); df.dateFormat = "yyyy-MM-dd"
let tokenRx = try! NSRegularExpression(pattern: "[a-z0-9._]{6,30}")
func csv(_ s: String) -> String { "\"" + s.replacingOccurrences(of: "\"", with: "'") + "\"" }

var flagged: [PHAsset] = []
var rows = ["date,file,why,possible_saved_account,text_start"]
for i in 0..<assets.count {
    autoreleasepool {
        let a = assets.object(at: i)
        let text = textOf(a)
        let low = text.lowercased()
        let hits = markers.filter { low.contains($0) }
        if low.contains("instagram") || hits.count >= 2 {
            var acct = ""
            if !saved.isEmpty {
                let ns = low as NSString
                for m in tokenRx.matches(in: low, range: NSRange(location: 0, length: ns.length)) {
                    let tok = ns.substring(with: m.range).trimmingCharacters(in: CharacterSet(charactersIn: "."))
                    if saved.contains(tok) { acct = tok; break }
                }
            }
            flagged.append(a)
            let name = PHAssetResource.assetResources(for: a).first?.originalFilename ?? ""
            let why = (low.contains("instagram") ? ["instagram"] : []) + hits
            rows.append([df.string(from: a.creationDate ?? Date(timeIntervalSince1970: 0)), csv(name),
                         csv(why.joined(separator: "; ")), csv(acct), csv(String(text.prefix(100)))].joined(separator: ","))
        }
        if (i + 1) % 100 == 0 { print("  \(i + 1)/\(assets.count) read, \(flagged.count) look like Instagram") }
    }
}

let out = repoRoot.appendingPathComponent("photos-instagram-screenshots.csv")
try? rows.joined(separator: "\n").write(to: out, atomically: true, encoding: .utf8)
let withAcct = rows.dropFirst().filter { !$0.contains(",\"\",\"") }.count
print("\n\(flagged.count) of \(assets.count) screenshots look like Instagram (\(withAcct) show an account you also have a saved post from).")
print("List written to \(out.path)")

if dry || flagged.isEmpty {
    print(dry ? "Dry run: nothing was added to an album. Run again without --dry to make the album." : "Nothing to add.")
    exit(0)
}

// ---- add to the album (create it if needed). Nothing is deleted.
let co = PHFetchOptions(); co.predicate = NSPredicate(format: "title = %@", albumName)
let existing = PHAssetCollection.fetchAssetCollections(with: .album, subtype: .albumRegular, options: co).firstObject
do {
    try PHPhotoLibrary.shared().performChangesAndWait {
        let req = existing != nil ? PHAssetCollectionChangeRequest(for: existing!)!
                                  : PHAssetCollectionChangeRequest.creationRequestForAssetCollection(withTitle: albumName)
        req.addAssets(flagged as NSArray)
    }
    print("Added \(flagged.count) screenshots to the album \"\(albumName)\" in Photos. Nothing was deleted; review the album and delete what you want.")
} catch {
    print("Couldn't add to the album: \(error.localizedDescription)")
}
