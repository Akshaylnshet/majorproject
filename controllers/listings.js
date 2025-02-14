const Listing=require("../models/listing")

module.exports.index=async (req,res)=>{
    const alllisting=await Listing.find({});
    res.render("listings/index.ejs",{alllisting});
}

module.exports.renderNewform=(req,res)=>{
   
    res.render("listings/new.ejs");
}

module.exports.showListing=(async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id)
    .populate({
        path:"reviews",
        populate:{
            path:"author",
        },
    })
    .populate("owner");
    if(!listing){
        req.flash("error","listing was deleted");
        res.redirect("/listings"); 
    }
    // console.log(listing);
    res.render("listings/show.ejs",{listing})
})

// module.exports.createListing=async (req,res,next)=>{
//     let url=req.file.path;
//     let filename=req.file.filename;
//     const newlisting=new Listing(req.body.listing);
//     newlisting.owner=req.user._id;
//     newlisting.image={url,filename};
//     await newlisting.save();
//     req.flash("success","new listing created");
//     res.redirect("/listings");
// }
module.exports.createListing = async (req, res, next) => {
    try {
        console.log("Request body:", req.body); // Check if form data is received
        console.log("Uploaded file:", req.file); // Check if the file is uploaded
        console.log("Current user:", req.user); // Ensure the user is authenticated

        if (!req.file) {
            throw new Error("File upload failed - No file received");
        }

        let url = req.file.path;
        let filename = req.file.filename;
        const newlisting = new Listing(req.body.listing);
        newlisting.owner = req.user._id;
        newlisting.image = { url, filename };

        await newlisting.save();
        req.flash("success", "New listing created");
        res.redirect("/listings");
    } catch (err) {
        console.error("Error creating listing:", err);
        res.status(500).send("Internal Server Error: " + err.message);
        next(err);
    }
};


module.exports.renderEditform=async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id);
    if(!listing){
        req.flash("error","listing was deleted");
        res.redirect("/listings"); 
    }
    let originalimageurl=listing.image.url;
    originalimageurl=originalimageurl.replace("/upload","/upload/h_200,w_250")
    res.render("listings/edit.ejs",{listing,originalimageurl})
}

module.exports.updateListing=async (req,res)=>{
    
    let {id}=req.params;
    let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing})
    if(typeof req.file !=="undefined"){
        let url=req.file.path;
    let filename=req.file.filename;
    listing.image={url,filename};
    await listing.save();
    }
    
    req.flash("success","listing updated ");
    res.redirect(`/listings/${id}`);
}

module.exports.deleteListing=async(req,res)=>{
    let {id}=req.params;
    let deletedlist= await Listing.findByIdAndDelete(id);
    console.log("list delete=",deletedlist);
    req.flash("success"," listing delete");
    res.redirect("/listings");
}